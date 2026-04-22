import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import fs from 'fs';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

  // Increase payload size limit for file uploads (base64 encoded files)
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));
  
  // Create uploads directory if it doesn't exist
  const uploadsDir = path.join(__dirname, 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  // Serve uploaded files statically
  app.use('/uploads', express.static(uploadsDir));

  // Database Initialization
  const db = await open({
    filename: './autoauth.db',
    driver: sqlite3.Database
  });

  // Create Tables
  await db.exec(`
    CREATE TABLE IF NOT EXISTS doctors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      specialization TEXT,
      status TEXT CHECK(status IN ('Pending', 'Approved', 'Rejected')) DEFAULT 'Pending'
    );

    CREATE TABLE IF NOT EXISTS patients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      age INTEGER,
      gender TEXT,
      contact TEXT,
      pain_history TEXT,
      medical_history TEXT
    );

    CREATE TABLE IF NOT EXISTS patient_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL,
      xray TEXT,
      mri TEXT,
      lab_report TEXT,
      FOREIGN KEY (patient_id) REFERENCES patients(id)
    );

    CREATE TABLE IF NOT EXISTS insurance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL,
      available BOOLEAN,
      company TEXT,
      policy_number TEXT,
      valid_till TEXT,
      plan TEXT CHECK(plan IN ('Basic', 'Premium')),
      FOREIGN KEY (patient_id) REFERENCES patients(id)
    );

    CREATE TABLE IF NOT EXISTS requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_id TEXT UNIQUE NOT NULL,
      patient_id INTEGER NOT NULL,
      doctor_id INTEGER NOT NULL,
      diagnosis TEXT,
      treatment TEXT,
      clinical_notes TEXT,
      ai_analysis TEXT,
      justification TEXT,
      status TEXT CHECK(status IN ('Pending', 'Approved', 'Rejected', 'Direct Treatment')) DEFAULT 'Pending',
      admin_comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES patients(id),
      FOREIGN KEY (doctor_id) REFERENCES doctors(id)
    );
  `);

  // Default Admin
  const adminEmail = 'admin@gmail.com';
  const adminPassword = 'admin123';

  // API Routes

  // Auth
  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    if (email === adminEmail && password === adminPassword) {
      return res.json({ 
        success: true, 
        user: { id: 'admin', name: 'System Admin', email: adminEmail, role: 'admin', status: 'Approved' } 
      });
    }

    const doctor = await db.get('SELECT * FROM doctors WHERE email = ? AND password = ?', [email, password]);
    if (!doctor) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (doctor.status !== 'Approved') {
      return res.status(403).json({ success: false, message: `Access denied. Your status is: ${doctor.status}` });
    }

    res.json({ 
      success: true, 
      user: { ...doctor, role: 'doctor' } 
    });
  });

  app.post('/api/auth/register', async (req, res) => {
    const { name, email, password, specialization } = req.body;
    try {
      await db.run(
        'INSERT INTO doctors (name, email, password, specialization, status) VALUES (?, ?, ?, ?, ?)',
        [name, email, password, specialization, 'Pending']
      );
      res.json({ success: true, message: 'Registration successful. Awaiting admin approval.' });
    } catch (error: any) {
      if (error.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ success: false, message: 'Email already exists' });
      }
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  });

  // Doctor Management (Admin)
  app.get('/api/admin/doctors', async (req, res) => {
    const doctors = await db.all('SELECT id, name, email, specialization, status FROM doctors');
    res.json(doctors);
  });

  app.post('/api/admin/doctors/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    await db.run('UPDATE doctors SET status = ? WHERE id = ?', [status, id]);
    res.json({ success: true });
  });

  // Patient Management (Doctor)
  // File Upload Endpoint
  app.post('/api/upload', async (req, res) => {
    try {
      const { filename, fileData, reportType } = req.body;
      
      console.log('Upload request received:', { filename, reportType, fileDataLength: fileData?.length });
      
      if (!filename || !fileData) {
        return res.status(400).json({ success: false, message: 'Filename and file data required' });
      }

      // Generate unique filename with timestamp
      const timestamp = Date.now();
      const fileExt = path.extname(filename);
      const uniqueFilename = `${reportType || 'report'}_${timestamp}${fileExt}`;
      const filePath = path.join(uploadsDir, uniqueFilename);

      console.log('Saving file to:', filePath);

      // Decode base64 and write file
      let base64Data = fileData;
      if (fileData.includes(',')) {
        base64Data = fileData.split(',')[1];
      }
      
      const buffer = Buffer.from(base64Data, 'base64');
      fs.writeFileSync(filePath, buffer);

      // Verify file was written
      const fileExists = fs.existsSync(filePath);
      const fileSize = fileExists ? fs.statSync(filePath).size : 0;
      console.log('File written:', { filePath, exists: fileExists, size: fileSize });

      const fileUrl = `/uploads/${uniqueFilename}`;
      res.json({ success: true, fileUrl, filename: uniqueFilename });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ success: false, message: `File upload failed: ${error}` });
    }
  });

  // AI Analysis Endpoint - server-side (uses GEMINI API key from env)
  const geminiApiKey = process.env.GEMINI_API_KEY?.trim() || '';
  let genAIService: any = null;
  if (geminiApiKey) {
    try {
      genAIService = new GoogleGenAI({ apiKey: geminiApiKey });
      console.log('GEMINI_API_KEY found; initialized GoogleGenAI service');
    } catch (e) {
      console.error('Failed to initialize GoogleGenAI on server:', e);
      genAIService = null;
    }
  } else {
    console.warn('GEMINI_API_KEY not set on server; /api/analyze will return fallback responses');
    console.warn('To enable AI analysis, create a .env file with GEMINI_API_KEY and restart the server. See .env.example');
  }

  app.post('/api/analyze', async (req, res) => {
    const { notes } = req.body || {};
    if (!notes) return res.status(400).json({ success: false, message: 'notes required' });

    const fallback = {
      condition: 'Extracted Condition from Notes',
      duration: 'Duration mentioned in notes',
      evidence: 'Evidence found in notes',
      summary: 'Brief summary (fallback)',
      justification: 'AI suggested justification (fallback)'
    };

    if (!genAIService) {
      return res.json(fallback);
    }

    try {
      const prompt = `Analyze the following clinical notes and extract key information for a prior authorization request.\nReturn the result in JSON format with the following fields: condition,duration,evidence,summary,justification.\n\nClinical Notes:\n${notes}`;

      const response = await genAIService.models.generateContent({
        model: 'gemini-2.5-flash-lite',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });

      // Extract text or object from common SDK shapes
      let text: string | undefined;
      if (!response) throw new Error('Empty response from genAI');
      if (typeof response === 'string') text = response;
      else if (response.text) text = response.text;
      else if (response.output && Array.isArray(response.output)) {
        const out = response.output.find((o: any) => o.content && Array.isArray(o.content));
        if (out) {
          const txt = out.content.find((c: any) => c.type === 'output_text' || c.type === 'text');
          if (txt) text = txt.text || txt.content || txt;
        }
      }

      if (text) {
        try {
          const parsed = JSON.parse(text);
          return res.json(parsed);
        } catch (e) {
          return res.json({ ...fallback, justification: String(text) });
        }
      }

      if (response.condition || response.justification || response.summary) {
        return res.json(response);
      }

      throw new Error('Unable to parse AI response');
    } catch (error) {
      console.error('Error in /api/analyze:', error);
      return res.json(fallback);
    }
  });

  app.post('/api/doctor/patients', async (req, res) => {
    // Accept both camelCase and snake_case from clients; normalize before DB insert
    const body: any = req.body || {};
    const name = body.name;
    const age = body.age;
    const gender = body.gender;
    const contact = body.contact;
    const pain_history = body.pain_history ?? body.painHistory ?? '';
    const medical_history = body.medical_history ?? body.medicalHistory ?? '';
    const reportsRaw = body.reports ?? {};
    const insuranceRaw = body.insurance ?? {};

    // Normalize insurance fields
    const insurance = {
      available: insuranceRaw.available ?? false,
      company: insuranceRaw.company ?? insuranceRaw.companyName ?? '',
      policy_number: insuranceRaw.policy_number ?? insuranceRaw.policyNumber ?? '',
      valid_till: insuranceRaw.valid_till ?? insuranceRaw.validTill ?? '',
      plan: insuranceRaw.plan ?? 'Basic'
    };

    // Normalize reports
    const reports = {
      xray: reportsRaw.xray ?? '',
      mri: reportsRaw.mri ?? '',
      lab_report: reportsRaw.lab_report ?? reportsRaw.labReport ?? ''
    };

    // Generate unique patient_id
    const countResult = await db.get('SELECT COUNT(*) as count FROM patients');
    const patient_id = `PAT${1001 + countResult.count}`;

    try {
      const result = await db.run(
        'INSERT INTO patients (patient_id, name, age, gender, contact, pain_history, medical_history) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [patient_id, name, age, gender, contact, pain_history, medical_history]
      );
      const db_patient_id = result.lastID;

      // Store reports
      if (reports) {
        await db.run(
          'INSERT INTO patient_reports (patient_id, xray, mri, lab_report) VALUES (?, ?, ?, ?)',
          [db_patient_id, reports.xray, reports.mri, reports.lab_report]
        );
      }

      // Store insurance
      if (insurance) {
        await db.run(
          'INSERT INTO insurance (patient_id, available, company, policy_number, valid_till, plan) VALUES (?, ?, ?, ?, ?, ?)',
          [db_patient_id, insurance.available, insurance.company, insurance.policy_number, insurance.valid_till, insurance.plan]
        );
      }

      res.json({ success: true, patient_id, id: db_patient_id });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to add patient' });
    }
  });

  // Update existing patient by DB id
  app.put('/api/doctor/patients/:id', async (req, res) => {
    const dbId = req.params.id;
    const body: any = req.body || {};
    const name = body.name;
    const age = body.age;
    const gender = body.gender;
    const contact = body.contact;
    const pain_history = body.pain_history ?? body.painHistory ?? '';
    const medical_history = body.medical_history ?? body.medicalHistory ?? '';
    const reportsRaw = body.reports ?? {};
    const insuranceRaw = body.insurance ?? {};

    const insurance = {
      available: insuranceRaw.available ?? false,
      company: insuranceRaw.company ?? insuranceRaw.companyName ?? '',
      policy_number: insuranceRaw.policy_number ?? insuranceRaw.policyNumber ?? '',
      valid_till: insuranceRaw.valid_till ?? insuranceRaw.validTill ?? '',
      plan: insuranceRaw.plan ?? 'Basic'
    };

    const reports = {
      xray: reportsRaw.xray ?? '',
      mri: reportsRaw.mri ?? '',
      lab_report: reportsRaw.lab_report ?? reportsRaw.labReport ?? ''
    };

    try {
      await db.run(
        'UPDATE patients SET name = ?, age = ?, gender = ?, contact = ?, pain_history = ?, medical_history = ? WHERE id = ?',
        [name, age, gender, contact, pain_history, medical_history, dbId]
      );

      // Upsert reports
      const existingReport = await db.get('SELECT id FROM patient_reports WHERE patient_id = ?', [dbId]);
      if (existingReport) {
        await db.run(
          'UPDATE patient_reports SET xray = ?, mri = ?, lab_report = ? WHERE patient_id = ?',
          [reports.xray, reports.mri, reports.lab_report, dbId]
        );
      } else {
        await db.run(
          'INSERT INTO patient_reports (patient_id, xray, mri, lab_report) VALUES (?, ?, ?, ?)',
          [dbId, reports.xray, reports.mri, reports.lab_report]
        );
      }

      // Upsert insurance
      const existingIns = await db.get('SELECT id FROM insurance WHERE patient_id = ?', [dbId]);
      if (existingIns) {
        await db.run(
          'UPDATE insurance SET available = ?, company = ?, policy_number = ?, valid_till = ?, plan = ? WHERE patient_id = ?',
          [insurance.available, insurance.company, insurance.policy_number, insurance.valid_till, insurance.plan, dbId]
        );
      } else {
        await db.run(
          'INSERT INTO insurance (patient_id, available, company, policy_number, valid_till, plan) VALUES (?, ?, ?, ?, ?, ?)',
          [dbId, insurance.available, insurance.company, insurance.policy_number, insurance.valid_till, insurance.plan]
        );
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Failed to update patient', error);
      res.status(500).json({ success: false, message: 'Failed to update patient' });
    }
  });

  app.get('/api/doctor/patients', async (req, res) => {
    const patients = await db.all(`
      SELECT p.*, i.available, i.company, i.policy_number, i.valid_till, i.plan,
             pr.xray as xray, pr.mri as mri, pr.lab_report as lab_report
      FROM patients p
      LEFT JOIN insurance i ON p.id = i.patient_id
      LEFT JOIN patient_reports pr ON p.id = pr.patient_id
    `);
    res.json(patients);
  });

  // Request Management
  app.post('/api/doctor/requests', async (req, res) => {
    const { patient_id, doctor_id, diagnosis, treatment, clinical_notes, ai_analysis, justification } = req.body;
    
    // Fetch patient and insurance data
    const patient = await db.get(`
      SELECT p.id, i.available, i.valid_till, i.plan 
      FROM patients p 
      LEFT JOIN insurance i ON p.id = i.patient_id 
      WHERE p.id = ? OR p.patient_id = ?`, 
      [patient_id, patient_id]
    );

    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });

    // Generate request_id
    const countResult = await db.get('SELECT COUNT(*) as count FROM requests');
    const request_id = `REQ${1001 + countResult.count}`;

    // Determine initial status
    let status = 'Pending';
    if (!patient.available || patient.available === 0 || patient.available === 'false') {
      status = 'Direct Treatment';
    }

    try {
      await db.run(
        `INSERT INTO requests (request_id, patient_id, doctor_id, diagnosis, treatment, clinical_notes, ai_analysis, justification, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [request_id, patient.id, doctor_id, diagnosis, treatment, clinical_notes, JSON.stringify(ai_analysis), justification, status]
      );
      res.json({ success: true, request_id });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to create request' });
    }
  });

  app.get('/api/requests', async (req, res) => {
    const requests = await db.all(`
      SELECT r.*, p.name as patient_name, p.patient_id as patient_code, d.name as doctor_name,
             i.available, i.valid_till, i.plan
      FROM requests r
      JOIN patients p ON r.patient_id = p.id
      JOIN doctors d ON r.doctor_id = d.id
      LEFT JOIN insurance i ON p.id = i.patient_id
    `);
    res.json(requests.map(r => ({ ...r, ai_analysis: JSON.parse(r.ai_analysis || '{}') })));
  });

  app.post('/api/admin/requests/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status, admin_comment } = req.body;
    await db.run('UPDATE requests SET status = ?, admin_comment = ? WHERE id = ?', [status, admin_comment, id]);
    res.json({ success: true });
  });

  // Stats
  app.get('/api/admin/stats', async (req, res) => {
    const stats = await db.get(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'Approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) as rejected,
        SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending
      FROM requests
    `);
    res.json(stats);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
