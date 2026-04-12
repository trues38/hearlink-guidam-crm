const { PrismaClient } = require('@prisma/client');
const express = require('express');
const cors = require('cors');

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'hearlink-crm-api' });
});

// Center API
app.get('/api/center/me', async (req, res) => {
  const center = await prisma.center.findFirst();
  if (!center) {
    return res.status(404).json({ error: 'No center found' });
  }
  res.json(center);
});

// WorkLogs CRUD
app.get('/api/worklogs', async (req, res) => {
  const { centerId, userId, customerId, type, skip = 0, limit = 20 } = req.query;
  
  const where = {};
  if (centerId) where.centerId = centerId;
  if (userId) where.userId = userId;
  if (customerId) where.customerId = customerId;
  if (type) where.type = type;

  const [items, total] = await Promise.all([
    prisma.workLog.findMany({
      where,
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    }),
    prisma.workLog.count({ where })
  ]);

  res.json({ items, total, skip: parseInt(skip), limit: parseInt(limit) });
});

app.get('/api/worklogs/:id', async (req, res) => {
  const worklog = await prisma.workLog.findUnique({ where: { id: req.params.id } });
  if (!worklog) return res.status(404).json({ error: 'WorkLog not found' });
  res.json(worklog);
});

app.post('/api/worklogs', async (req, res) => {
  const { centerId, userId, customerId, type, content, metadata } = req.body;
  const worklog = await prisma.workLog.create({
    data: { centerId, userId, customerId, type, content, metadata }
  });
  res.status(201).json(worklog);
});

app.put('/api/worklogs/:id', async (req, res) => {
  const { customerId, type, content, metadata } = req.body;
  const worklog = await prisma.workLog.update({
    where: { id: req.params.id },
    data: { customerId, type, content, metadata }
  });
  res.json(worklog);
});

app.delete('/api/worklogs/:id', async (req, res) => {
  await prisma.workLog.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

// Notifications CRUD
app.get('/api/notifications', async (req, res) => {
  const { centerId, userId, isRead, skip = 0, limit = 20 } = req.query;
  
  const where = {};
  if (centerId) where.centerId = centerId;
  if (userId) where.userId = userId;
  if (isRead !== undefined) where.isRead = isRead === 'true';

  const [items, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    }),
    prisma.notification.count({ where })
  ]);

  res.json({ items, total, skip: parseInt(skip), limit: parseInt(limit) });
});

app.get('/api/notifications/:id', async (req, res) => {
  const notification = await prisma.notification.findUnique({ where: { id: req.params.id } });
  if (!notification) return res.status(404).json({ error: 'Notification not found' });
  res.json(notification);
});

app.post('/api/notifications', async (req, res) => {
  const { centerId, userId, type, title, content, link } = req.body;
  const notification = await prisma.notification.create({
    data: { centerId, userId, type, title, content, link }
  });
  res.status(201).json(notification);
});

app.put('/api/notifications/:id/read', async (req, res) => {
  const notification = await prisma.notification.update({
    where: { id: req.params.id },
    data: { isRead: true }
  });
  res.json({ success: true, id: notification.id });
});

app.post('/api/notifications/send', async (req, res) => {
  const { notificationId, recipientNumber, templateCode } = req.body;
  
  const notification = await prisma.notification.findUnique({ where: { id: notificationId } });
  if (!notification) return res.status(404).json({ error: 'Notification not found' });

  const log = await prisma.kakaoTalkLog.create({
    data: {
      notificationId,
      centerId: notification.centerId,
      recipientNumber,
      templateCode: templateCode || 'test_template',
      content: notification.content,
      status: 'SENT',
      sentAt: new Date()
    }
  });

  await prisma.notification.update({
    where: { id: notificationId },
    data: { kakaoSent: true, kakaoSentAt: new Date() }
  });

  res.json({ success: true, logId: log.id, message: 'KakaoTalk sent (test mode)' });
});

// Documents CRUD
app.get('/api/documents', async (req, res) => {
  const { customerId, purpose, insuranceType, type, skip = 0, limit = 20 } = req.query;
  
  const where = {};
  if (customerId) where.customerId = customerId;
  if (purpose) where.purpose = purpose;
  if (insuranceType) where.insuranceType = insuranceType;
  if (type) where.type = type;

  const [items, total] = await Promise.all([
    prisma.document.findMany({
      where,
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    }),
    prisma.document.count({ where })
  ]);

  res.json({ items, total, skip: parseInt(skip), limit: parseInt(limit) });
});

app.get('/api/documents/:id', async (req, res) => {
  const document = await prisma.document.findUnique({ where: { id: req.params.id } });
  if (!document) return res.status(404).json({ error: 'Document not found' });
  res.json(document);
});

app.post('/api/documents', async (req, res) => {
  const { customerId, purpose, insuranceType, type, key } = req.body;
  
  const existing = await prisma.document.findFirst({
    where: { customerId, purpose, insuranceType, type }
  });
  if (existing) return res.status(400).json({ error: 'Document already exists' });

  const document = await prisma.document.create({
    data: { customerId, purpose, insuranceType, type, key }
  });
  res.status(201).json(document);
});

app.post('/api/documents/:id/preview', async (req, res) => {
  const document = await prisma.document.findUnique({ where: { id: req.params.id } });
  if (!document) return res.status(404).json({ error: 'Document not found' });

  const customer = await prisma.customer.findUnique({ where: { id: document.customerId } });

  const preview = await prisma.documentPreview.upsert({
    where: { documentId: req.params.id },
    create: {
      documentId: req.params.id,
      previewUrl: `file:///tmp/hearlink_previews/${document.id}.html`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    },
    update: {
      previewUrl: `file:///tmp/hearlink_previews/${document.id}.html`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    }
  });

  res.json(preview);
});

app.post('/api/documents/:id/link', async (req, res) => {
  const { sourceType, sourceId } = req.body;
  const document = await prisma.document.findUnique({ where: { id: req.params.id } });
  if (!document) return res.status(404).json({ error: 'Document not found' });

  let mappedFields = {};
  if (sourceType === 'CUSTOMER_FORM') {
    const customer = await prisma.customer.findUnique({ where: { id: document.customerId } });
    if (customer) {
      mappedFields = { name: customer.name, contactNumber: customer.contactNumber };
    }
  }

  const linkage = await prisma.documentDataLinkage.create({
    data: {
      documentId: req.params.id,
      sourceType,
      sourceId,
      mappedFields,
      status: 'LINKED'
    }
  });

  res.json(linkage);
});

// TossPay Integration
app.post('/api/payments/toss/request', async (req, res) => {
  const { orderId } = req.body;
  const payment = await prisma.tossPayment.findUnique({ where: { orderId } });
  if (!payment) return res.status(404).json({ error: 'Payment not found' });

  await prisma.tossPayment.update({
    where: { orderId },
    data: { status: 'IN_PROGRESS' }
  });

  res.json({
    orderId,
    paymentUrl: `https://api-sandbox.tosspayments.com/v1/payments/${orderId}`
  });
});

app.post('/api/payments/toss/confirm', async (req, res) => {
  const { orderId, paymentKey, amount } = req.body;
  
  const payment = await prisma.tossPayment.findUnique({ where: { orderId } });
  if (!payment) return res.status(404).json({ error: 'Payment not found' });
  if (payment.amount !== amount) return res.status(400).json({ error: 'Amount mismatch' });

  const updated = await prisma.tossPayment.update({
    where: { orderId },
    data: { paymentKey, status: 'DONE', approvedAt: new Date() }
  });

  res.json(updated);
});

app.post('/api/payments/toss/cancel', async (req, res) => {
  const { orderId, cancelReason } = req.body;
  
  const updated = await prisma.tossPayment.update({
    where: { orderId },
    data: { status: 'CANCELLED', cancelledAt: new Date(), failReason: cancelReason || 'Cancelled' }
  });

  res.json(updated);
});

// Barobill Fax
app.post('/api/payments/barobill/send', async (req, res) => {
  const { centerId, customerId, taxInvoiceId, mgtNum, faxNumber, documentType, fileUrl } = req.body;
  
  const fax = await prisma.barobillFax.create({
    data: {
      centerId, customerId, taxInvoiceId, mgtNum, faxNumber, documentType, fileUrl,
      status: 'TRANSMITTING', sentAt: new Date()
    }
  });

  res.status(201).json(fax);
});

app.get('/api/payments/barobill/status/:faxId', async (req, res) => {
  const fax = await prisma.barobillFax.findUnique({ where: { id: req.params.faxId } });
  if (!fax) return res.status(404).json({ error: 'Fax not found' });
  res.json(fax);
});

// Payment Domain (일반 결제 - Sale 기반)
app.get('/api/payments', async (req, res) => {
  const { centerId, customerId, status, skip = 0, limit = 20 } = req.query;
  
  const where = {};
  if (centerId) where.centerId = centerId;
  if (customerId) where.customerId = customerId;
  if (status) where.status = status;

  const [items, total] = await Promise.all([
    prisma.sale.findMany({
      where,
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      include: { tossPayments: true }
    }),
    prisma.sale.count({ where })
  ]);

  res.json({ items, total, skip: parseInt(skip), limit: parseInt(limit) });
});

app.get('/api/payments/:id', async (req, res) => {
  const payment = await prisma.sale.findUnique({
    where: { id: req.params.id },
    include: { tossPayments: true, customer: true }
  });
  if (!payment) return res.status(404).json({ error: 'Payment not found' });
  res.json(payment);
});

app.post('/api/payments', async (req, res) => {
  const { centerId, customerId, totalAmount, paidAmount, memo, status } = req.body;
  const payment = await prisma.sale.create({
    data: {
      centerId,
      customerId,
      totalAmount: parseInt(totalAmount),
      paidAmount: parseInt(paidAmount || 0),
      memo,
      status: status || 'UNPAID',
      data: {}
    }
  });
  res.status(201).json(payment);
});

app.put('/api/payments/:id', async (req, res) => {
  const { totalAmount, paidAmount, memo, status } = req.body;
  const payment = await prisma.sale.update({
    where: { id: req.params.id },
    data: {
      ...(totalAmount !== undefined && { totalAmount: parseInt(totalAmount) }),
      ...(paidAmount !== undefined && { paidAmount: parseInt(paidAmount) }),
      ...(memo !== undefined && { memo }),
      ...(status !== undefined && { status })
    }
  });
  res.json(payment);
});

// TossPay Payment Links to Sale (Payment가 상위 도메인)
app.post('/api/payments/:saleId/toss', async (req, res) => {
  const { saleId } = req.params;
  const { centerId, customerId, amount, method } = req.body;
  
  const sale = await prisma.sale.findUnique({ where: { id: saleId } });
  if (!sale) return res.status(404).json({ error: 'Sale not found' });

  const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const tossPayment = await prisma.tossPayment.create({
    data: {
      centerId: sale.centerId,
      customerId: sale.customerId,
      saleId: sale.id,
      orderId,
      amount: parseInt(amount),
      method,
      status: 'READY'
    }
  });

  res.status(201).json({ sale, tossPayment });
});

// Customer CRUD
app.get('/api/customers', async (req, res) => {
  const { centerId, search, classification, skip = 0, limit = 20 } = req.query;
  
  const where = {};
  if (centerId) where.centerId = centerId;
  if (classification) where.classification = classification;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { contactNumber: { contains: search, mode: 'insensitive' } }
    ];
  }

  const [items, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    }),
    prisma.customer.count({ where })
  ]);

  res.json({ items, total, skip: parseInt(skip), limit: parseInt(limit) });
});

app.get('/api/customers/:id', async (req, res) => {
  const customer = await prisma.customer.findUnique({
    where: { id: req.params.id },
    include: {
      consultations: { orderBy: { consultedAt: 'desc' }, take: 10 },
      audiometries: { orderBy: { createdAt: 'desc' }, include: { pureToneResults: true } },
      sales: { orderBy: { createdAt: 'desc' }, include: { tossPayments: true } },
      workLogs: { orderBy: { createdAt: 'desc' }, take: 10 },
      documents: { orderBy: { createdAt: 'desc' }, take: 10 },
      notifications: { orderBy: { createdAt: 'desc' }, take: 10 }
    }
  });
  if (!customer) return res.status(404).json({ error: 'Customer not found' });
  res.json(customer);
});

app.post('/api/customers', async (req, res) => {
  const {
    centerId, name, contactNumber, birthDate, gender, email, residentNumber,
    classification, governmentSupportType, processType, recipientType, lossType,
    referralSource, hospitalName, memo
  } = req.body;

  const customer = await prisma.customer.create({
    data: {
      centerId,
      name,
      contactNumber,
      ...(birthDate && { birthDate: new Date(birthDate) }),
      gender,
      email,
      residentNumber,
      classification,
      governmentSupportType,
      processType,
      recipientType,
      lossType,
      referralSource,
      hospitalName,
      memo
    }
  });
  res.status(201).json(customer);
});

app.put('/api/customers/:id', async (req, res) => {
  const data = req.body;
  if (data.birthDate) data.birthDate = new Date(data.birthDate);
  
  const customer = await prisma.customer.update({
    where: { id: req.params.id },
    data
  });
  res.json(customer);
});

// Consultation CRUD
app.get('/api/consultations', async (req, res) => {
  const { customerId, skip = 0, limit = 20 } = req.query;
  
  const where = {};
  if (customerId) where.customerId = customerId;

  const [items, total] = await Promise.all([
    prisma.consultation.findMany({
      where,
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: { consultedAt: 'desc' },
      include: { customer: true }
    }),
    prisma.consultation.count({ where })
  ]);

  res.json({ items, total, skip: parseInt(skip), limit: parseInt(limit) });
});

app.post('/api/consultations', async (req, res) => {
  const { customerId, content, method, consultedAt } = req.body;
  const consultation = await prisma.consultation.create({
    data: { customerId, content, method, consultedAt: new Date(consultedAt) },
    include: { customer: true }
  });
  res.status(201).json(consultation);
});

// Audiometry CRUD
app.get('/api/audiometries', async (req, res) => {
  const { customerId, skip = 0, limit = 20 } = req.query;
  
  const where = {};
  if (customerId) where.customerId = customerId;

  const [items, total] = await Promise.all([
    prisma.audiometry.findMany({
      where,
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      include: { pureToneResults: true, speechTestResults: true }
    }),
    prisma.audiometry.count({ where })
  ]);

  res.json({ items, total, skip: parseInt(skip), limit: parseInt(limit) });
});

app.post('/api/audiometries', async (req, res) => {
  const { customerId, lossType, pureToneResults, speechTestResults } = req.body;
  
  const audiometry = await prisma.audiometry.create({
    data: {
      customerId,
      lossType,
      pureToneResults: pureToneResults ? {
        create: pureToneResults.map(r => ({
          ear: r.ear,
          testType: r.testType,
          frequency: r.frequency,
          decibel: r.decibel,
          masked: r.masked || false,
          noResponse: r.noResponse || false
        }))
      } : undefined,
      speechTestResults: speechTestResults ? {
        create: speechTestResults.map(r => ({
          ear: r.ear,
          decibel: r.decibel,
          percentage: r.percentage
        }))
      } : undefined
    },
    include: { pureToneResults: true, speechTestResults: true }
  });
  res.status(201).json(audiometry);
});

// Schedule CRUD
app.get('/api/schedules', async (req, res) => {
  const { centerId, customerId, date, skip = 0, limit = 50 } = req.query;
  
  const where = {};
  if (centerId) where.centerId = centerId;
  if (customerId) where.customerId = customerId;
  if (date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    where.scheduledAt = { gte: startOfDay, lte: endOfDay };
  }

  const [items, total] = await Promise.all([
    prisma.schedule.findMany({
      where,
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: { scheduledAt: 'asc' },
      include: { customer: true }
    }),
    prisma.schedule.count({ where })
  ]);

  res.json({ items, total, skip: parseInt(skip), limit: parseInt(limit) });
});

app.get('/api/schedules/calendar', async (req, res) => {
  const { centerId, startDate, endDate } = req.query;
  
  const where = {};
  if (centerId) where.centerId = centerId;
  if (startDate && endDate) {
    where.scheduledAt = {
      gte: new Date(startDate),
      lte: new Date(endDate)
    };
  }

  const schedules = await prisma.schedule.findMany({
    where,
    orderBy: { scheduledAt: 'asc' },
    include: { customer: true }
  });

  res.json(schedules);
});

app.post('/api/schedules', async (req, res) => {
  const { centerId, customerId, title, description, scheduledAt } = req.body;
  const schedule = await prisma.schedule.create({
    data: { centerId, customerId, title, description, scheduledAt: new Date(scheduledAt) },
    include: { customer: true }
  });
  res.status(201).json(schedule);
});

app.put('/api/schedules/:id', async (req, res) => {
  const { title, description, scheduledAt } = req.body;
  const schedule = await prisma.schedule.update({
    where: { id: req.params.id },
    data: { ...(title && { title }), ...(description && { description }), ...(scheduledAt && { scheduledAt: new Date(scheduledAt) }) },
    include: { customer: true }
  });
  res.json(schedule);
});

app.delete('/api/schedules/:id', async (req, res) => {
  await prisma.schedule.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Hearlink CRM API running on port ${PORT}`);
});
