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
      consultations: { orderBy: { consultedAt: 'desc' } },
      audiometries: { orderBy: { createdAt: 'desc' }, include: { pureToneResults: true } },
      sales: { orderBy: { createdAt: 'desc' }, include: { tossPayments: true } },
      schedules: { orderBy: { scheduledAt: 'asc' } },
      devices: true,
      workLogs: { orderBy: { createdAt: 'desc' }, take: 10 },
      documents: { orderBy: { createdAt: 'desc' }, take: 10 },
      notifications: { orderBy: { createdAt: 'desc' }, take: 10 },
      fittingLogs: { orderBy: { createdAt: 'desc' }, take: 20 }
    }
  });
  if (!customer) return res.status(404).json({ error: 'Customer not found' });

  const { computeCustomerInsights } = require('./services/customerComputed');
  const computed = computeCustomerInsights(customer);

  const response = {
    ...customer,
    payments: customer.sales,
    computed
  };

  res.json(response);
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

app.put('/api/consultations/:id', async (req, res) => {
  const { content, method, consultedAt } = req.body;
  const consultation = await prisma.consultation.update({
    where: { id: req.params.id },
    data: {
      ...(content && { content }),
      ...(method && { method }),
      ...(consultedAt && { consultedAt: new Date(consultedAt) }),
    },
    include: { customer: true },
  });
  res.json(consultation);
});

app.delete('/api/consultations/:id', async (req, res) => {
  await prisma.consultation.delete({ where: { id: req.params.id } });
  res.status(204).send();
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

// ============================================
// Phase 3: Device/장비 Management
// ============================================

// Device CRUD (center-level inventory)
app.get('/api/devices', async (req, res) => {
  const { centerId, brand, type, ear, hasSerial } = req.query;
  const where = {};
  if (centerId) where.centerId = centerId;
  if (brand) where.brand = brand;
  if (type) where.type = type;
  if (ear) where.ear = ear;

  const items = await prisma.device.findMany({ where, include: { serialNumbers: true } });
  res.json({ items });
});

app.post('/api/devices', async (req, res) => {
  const { centerId, brand, model, type, ear, color, heardotcom, used, governmentSupport } = req.body;
  const device = await prisma.device.create({
    data: { centerId, brand, model, type, ear, color, heardotcom, used, governmentSupport }
  });
  res.status(201).json(device);
});

// Device Serial - MUST be before /:id to avoid route conflict
app.get('/api/devices/serial/:serial', async (req, res) => {
  const centerId = req.query.centerId;
  if (!centerId) return res.status(400).json({ error: 'centerId is required' });
  const serial = await prisma.deviceSerialNumber.findUnique({
    where: { centerId_serialNumber: { centerId, serialNumber: req.params.serial } },
    include: { device: true }
  });
  if (!serial) return res.status(404).json({ error: 'Serial not found' });
  res.json(serial);
});

app.get('/api/devices/:id', async (req, res) => {
  const device = await prisma.device.findUnique({
    where: { id: req.params.id },
    include: { serialNumbers: true }
  });
  if (!device) return res.status(404).json({ error: 'Device not found' });
  res.json(device);
});

app.put('/api/devices/:id', async (req, res) => {
  const device = await prisma.device.update({
    where: { id: req.params.id },
    data: req.body
  });
  res.json(device);
});

// Device Serial Numbers
app.post('/api/devices/:id/serials', async (req, res) => {
  const { centerId, serialNumber } = req.body;
  const serial = await prisma.deviceSerialNumber.create({
    data: { deviceId: req.params.id, centerId, serialNumber }
  });
  res.status(201).json(serial);
});

// CustomerDevice (장비-고객 연결 라이프사이클)
app.get('/api/customer-devices', async (req, res) => {
  const { customerId } = req.query;
  const where = {};
  if (customerId) where.customerId = customerId;
  const items = await prisma.customerDevice.findMany({ where, orderBy: { createdAt: 'desc' } });
  res.json({ items });
});

app.post('/api/customer-devices', async (req, res) => {
  const { customerId, brand, model, type, color, ear, receiver, serialNumber, memo } = req.body;
  const device = await prisma.customerDevice.create({
    data: { customerId, brand, model, type, color, ear, receiver, serialNumber, memo }
  });
  res.status(201).json(device);
});

app.put('/api/customer-devices/:id', async (req, res) => {
  const device = await prisma.customerDevice.update({
    where: { id: req.params.id },
    data: req.body
  });
  res.json(device);
});

app.delete('/api/customer-devices/:id', async (req, res) => {
  await prisma.customerDevice.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

// ============================================
// Phase 3: Fitting/피팅 Management
// ============================================

app.get('/api/fittings', async (req, res) => {
  const { customerId, skip = 0, limit = 20 } = req.query;
  const where = {};
  if (customerId) where.customerId = customerId;

  const [items, total] = await Promise.all([
    prisma.fittingLog.findMany({ where, skip: parseInt(skip), take: parseInt(limit), orderBy: { createdAt: 'desc' } }),
    prisma.fittingLog.count({ where })
  ]);
  res.json({ items, total });
});

app.post('/api/fittings', async (req, res) => {
  const { customerId, brand, model, ear, content, createdBy } = req.body;
  const fitting = await prisma.fittingLog.create({
    data: { customerId, brand, model, ear, content, createdBy }
  });
  
  // Create customer event
  await prisma.customerEvent.create({
    data: {
      customerId,
      eventType: 'FITTING_CREATED',
      payload: JSON.stringify({ fittingId: fitting.id, ear }),
    }
  });
  
  res.status(201).json(fitting);
});

app.get('/api/fittings/:id', async (req, res) => {
  const fitting = await prisma.fittingLog.findUnique({ where: { id: req.params.id } });
  if (!fitting) return res.status(404).json({ error: 'Fitting not found' });
  res.json(fitting);
});

app.put('/api/fittings/:id', async (req, res) => {
  const fitting = await prisma.fittingLog.update({
    where: { id: req.params.id },
    data: req.body
  });
  res.json(fitting);
});

// ============================================
// Phase 3: Conformity/적합성 심사
// ============================================

// Center-level conformity list (avoids N+1)
app.get('/api/conformity', async (req, res) => {
  const { centerId, status, skip = 0, limit = 100 } = req.query;
  const where = {};
  if (status) where.status = status;
  // Validate UUID format before filtering by centerId to avoid Prisma errors
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (centerId && uuidRegex.test(centerId)) {
    where.customer = { centerId };
  }
  
  const [items, total] = await Promise.all([
    prisma.conformityRecord.findMany({
      where,
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      include: { customer: { select: { id: true, name: true, contactNumber: true } } }
    }),
    prisma.conformityRecord.count({ where })
  ]);
  res.json({ items, total, skip: parseInt(skip), limit: parseInt(limit) });
});

app.get('/api/conformity/:customerId', async (req, res) => {
  const records = await prisma.conformityRecord.findMany({
    where: { customerId: req.params.customerId },
    orderBy: { round: 'desc' }
  });
  res.json({ items: records });
});

app.post('/api/conformity/:customerId', async (req, res) => {
  const { supportType, recipientType, status, missingDocs, notes, reviewedBy } = req.body;
  
  // Get max round
  const last = await prisma.conformityRecord.findFirst({
    where: { customerId: req.params.customerId },
    orderBy: { round: 'desc' }
  });
  const newRound = (last?.round || 0) + 1;
  
  const record = await prisma.conformityRecord.create({
    data: {
      customerId: req.params.customerId,
      round: newRound,
      supportType,
      recipientType,
      status: status || 'PENDING',
      missingDocs: missingDocs ? JSON.stringify(missingDocs) : '[]',
      notes,
      reviewedBy
    }
  });
  
  res.status(201).json(record);
});

app.put('/api/conformity/:customerId/status', async (req, res) => {
  const { round, status, notes, missingDocs } = req.body;
  
  const record = await prisma.conformityRecord.findFirst({
    where: { customerId: req.params.customerId, round: parseInt(round) }
  });
  
  if (!record) return res.status(404).json({ error: 'Record not found' });
  
  const updated = await prisma.conformityRecord.update({
    where: { id: record.id },
    data: {
      status,
      notes,
      missingDocs: missingDocs ? JSON.stringify(missingDocs) : undefined,
      reviewedAt: new Date()
    }
  });
  
  res.json(updated);
});

// ============================================
// Phase 3: Tasks + Rule Engine
// ============================================

app.get('/api/tasks', async (req, res) => {
  const { centerId, customerId, status, assigneeId, skip = 0, limit = 50 } = req.query;
  const where = {};
  if (centerId) where.centerId = centerId;
  if (customerId) where.customerId = customerId;
  if (assigneeId) where.assigneeId = assigneeId;
  
  const [items, total] = await Promise.all([
    prisma.task.findMany({
      where,
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      include: { customer: { select: { id: true, name: true, contactNumber: true } } }
    }),
    prisma.task.count({ where })
  ]);
  res.json({ items, total });
});

app.post('/api/tasks', async (req, res) => {
  const { centerId, customerId, type, memo, data, assigneeId, dueAt, priority } = req.body;
  const task = await prisma.task.create({
    data: {
      centerId: centerId || 'default-center-id',
      customerId,
      type,
      memo,
      data: data || {},
      assigneeId,
      dueAt: dueAt ? new Date(dueAt) : null,
      orderedAt: new Date()
    }
  });
  
  // Create customer event
  if (customerId) {
    await prisma.customerEvent.create({
      data: {
        customerId,
        eventType: 'TASK_CREATED',
        payload: JSON.stringify({ taskId: task.id, type })
      }
    });
  }
  
  res.status(201).json(task);
});

app.put('/api/tasks/:id', async (req, res) => {
  const task = await prisma.task.update({
    where: { id: req.params.id },
    data: req.body
  });
  res.json(task);
});

app.put('/api/tasks/:id/complete', async (req, res) => {
  const task = await prisma.task.update({
    where: { id: req.params.id },
    data: { arrivedAt: new Date() }
  });
  res.json(task);
});

// ============================================
// Phase 3: Customer Events (Event Sourcing)
// ============================================

app.get('/api/customers/:customerId/events', async (req, res) => {
  const { skip = 0, limit = 50 } = req.query;
  const [items, total] = await Promise.all([
    prisma.customerEvent.findMany({
      where: { customerId: req.params.customerId },
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: { eventAt: 'desc' }
    }),
    prisma.customerEvent.count({ where: { customerId: req.params.customerId } })
  ]);
  res.json({ items, total });
});

app.post('/api/customers/:customerId/events', async (req, res) => {
  const { eventType, payload, createdBy } = req.body;
  const event = await prisma.customerEvent.create({
    data: {
      customerId: req.params.customerId,
      eventType,
      payload: payload ? JSON.stringify(payload) : null,
      createdBy
    }
  });
  res.status(201).json(event);
});

// ============================================
// Phase 3: Inventory (Battery/Accessory)
// ============================================

app.get('/api/inventory/batteries', async (req, res) => {
  const { centerId } = req.query;
  const items = await prisma.battery.findMany({
    where: centerId ? { centerId } : {},
    orderBy: { model: 'asc' }
  });
  res.json({ items });
});

app.post('/api/inventory/batteries', async (req, res) => {
  const { centerId, model, brand, quantity, lowStockAt } = req.body;
  const item = await prisma.battery.create({
    data: { centerId, model, brand, quantity, lowStockAt: lowStockAt || 5 }
  });
  res.status(201).json(item);
});

app.put('/api/inventory/batteries/:id', async (req, res) => {
  const item = await prisma.battery.update({
    where: { id: req.params.id },
    data: req.body
  });
  res.json(item);
});

app.post('/api/inventory/batteries/:id/adjust', async (req, res) => {
  const { delta, reason } = req.body;
  const battery = await prisma.battery.findUnique({ where: { id: req.params.id } });
  if (!battery) return res.status(404).json({ error: 'Battery not found' });
  
  const updated = await prisma.battery.update({
    where: { id: req.params.id },
    data: { quantity: { increment: delta } }
  });
  
  res.json({ item: updated, reason, delta });
});

app.get('/api/inventory/accessories', async (req, res) => {
  const { centerId } = req.query;
  const items = await prisma.accessory.findMany({
    where: centerId ? { centerId } : {},
    orderBy: { model: 'asc' }
  });
  res.json({ items });
});

app.post('/api/inventory/accessories', async (req, res) => {
  const { centerId, model, brand, type, quantity, lowStockAt } = req.body;
  const item = await prisma.accessory.create({
    data: { centerId, model, brand, type, quantity, lowStockAt: lowStockAt || 5 }
  });
  res.status(201).json(item);
});

app.put('/api/inventory/accessories/:id', async (req, res) => {
  const item = await prisma.accessory.update({
    where: { id: req.params.id },
    data: req.body
  });
  res.json(item);
});

app.post('/api/inventory/accessories/:id/adjust', async (req, res) => {
  const { delta, reason } = req.body;
  const accessory = await prisma.accessory.findUnique({ where: { id: req.params.id } });
  if (!accessory) return res.status(404).json({ error: 'Accessory not found' });
  
  const updated = await prisma.accessory.update({
    where: { id: req.params.id },
    data: { quantity: { increment: delta } }
  });
  
  res.json({ item: updated, reason, delta });
});

// ============================================
// Phase 3: Task Rules (Rule Engine Seed)
// ============================================

app.get('/api/task-rules', async (req, res) => {
  const rules = await prisma.taskRule.findMany({ orderBy: { priority: 'asc' } });
  res.json({ items: rules });
});

app.post('/api/task-rules', async (req, res) => {
  const { code, name, enabled, priority, condition, actionType, actionTitle, dueDays } = req.body;
  const rule = await prisma.taskRule.create({
    data: { code, name, enabled: enabled !== false, priority: priority || 0, condition: JSON.stringify(condition), actionType, actionTitle, dueDays }
  });
  res.status(201).json(rule);
});

// ============================================
// Statistics/Dashboard APIs
// ============================================

app.get('/api/stats/dashboard', async (req, res) => {
  const { centerId, startDate, endDate } = req.query;
  
  // Get date range
  const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const end = endDate ? new Date(endDate) : new Date();
  
  // Customers count
  const totalCustomers = await prisma.customer.count({ where: centerId ? { centerId } : {} });
  
  // Sales stats
  const sales = await prisma.sale.findMany({
    where: centerId ? { centerId } : {},
    include: { customer: true }
  });
  
  const totalRevenue = sales.filter(s => s.status === 'PAID').reduce((sum, s) => sum + s.paidAmount, 0);
  const unpaidCount = sales.filter(s => s.status === 'UNPAID').length;
  const unpaidAmount = sales.filter(s => s.status === 'UNPAID').reduce((sum, s) => sum + (s.totalAmount - s.paidAmount), 0);
  
  // Schedules this month
  const schedulesThisMonth = await prisma.schedule.count({
    where: {
      centerId: centerId || undefined,
      scheduledAt: { gte: start, lte: end }
    }
  });
  
  // Consultation count
  const consultationsThisMonth = await prisma.consultation.count({
    where: { consultedAt: { gte: start, lte: end } }
  });
  
  // Conformity stats
  const conformityStats = await prisma.conformityRecord.groupBy({
    by: ['status'],
    _count: true
  });
  
  // Customer stage distribution (based on computed logic)
  const customers = await prisma.customer.findMany({
    where: centerId ? { centerId } : {},
    include: {
      consultations: { take: 1, orderBy: { consultedAt: 'desc' } },
      audiometries: { take: 1, orderBy: { createdAt: 'desc' } },
      sales: { take: 1, orderBy: { createdAt: 'desc' } }
    }
  });
  
  const stageDistribution = {
    NEW: customers.filter(c => c.consultations.length === 0).length,
    CONSULTED: customers.filter(c => c.consultations.length > 0 && c.audiometries.length === 0).length,
    TESTED: customers.filter(c => c.audiometries.length > 0 && c.sales.length === 0).length,
    PURCHASED: customers.filter(c => c.sales.some(s => s.status === 'PAID')).length,
    UNPAID: customers.filter(c => c.sales.some(s => s.status === 'UNPAID')).length
  };
  
  res.json({
    totalCustomers,
    revenue: { total: totalRevenue, unpaidCount, unpaidAmount },
    schedulesThisMonth,
    consultationsThisMonth,
    conformityStats,
    stageDistribution
  });
});

// Health check endpoint for monitoring
app.get('/healthz', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'hearlink-crm-api',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Hearlink CRM API running on port ${PORT}`);
});
