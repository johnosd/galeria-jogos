import { randomUUID } from 'crypto';
import { MongoClient, ServerApiVersion } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

if (!uri) {
  throw new Error('Por favor defina a variavel de ambiente MONGODB_URI');
}

if (!dbName) {
  throw new Error('Por favor defina a variavel de ambiente MONGODB_DB');
}

const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
};

let client;
let clientPromise;

if (process.env.NODE_ENV === 'development') {
  // Reutiliza conexao durante desenvolvimento
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // Producao: cria nova conexao
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export async function getDb() {
  const mongoClient = await clientPromise;
  return mongoClient.db(dbName);
}

export async function getWalletByUser(userId) {
  const db = await getDb();
  return db.collection('wallets').findOne({ userId });
}

export async function createWallet({ userId, status = 'active' }) {
  if (!userId) {
    throw new Error('userId e obrigatorio para criar carteira');
  }
  const db = await getDb();
  const wallet = {
    _id: randomUUID(),
    userId,
    status,
    createdAt: new Date(),
  };
  await db.collection('wallets').insertOne(wallet);
  return wallet;
}

export async function insertPayment({
  userId,
  gateway,
  externalId = null,
  amount,
  status = 'pending',
  createdAt = new Date(),
}) {
  if (!userId || !gateway || !amount) {
    throw new Error('userId, gateway e amount sao obrigatorios para criar pagamento');
  }
  const db = await getDb();
  const payment = {
    _id: randomUUID(),
    userId,
    gateway,
    externalId,
    amount,
    status,
    createdAt,
  };
  await db.collection('payments').insertOne(payment);
  return payment;
}

export async function insertLedgerEntry({
  walletId,
  type,
  amount,
  source,
  referenceId = null,
  status = 'pending',
  description = null,
  createdAt = new Date(),
}) {
  if (!walletId || !type || !amount || !source) {
    throw new Error('walletId, type, source e amount sao obrigatorios para lancamentos');
  }
  const db = await getDb();
  const ledgerEntry = {
    _id: randomUUID(),
    walletId,
    type,
    amount,
    source,
    referenceId,
    status,
    ...(description ? { description } : {}),
    createdAt,
  };
  await db.collection('walletTransactions').insertOne(ledgerEntry);
  return ledgerEntry;
}

export async function insertWithdrawal({
  userId,
  walletId,
  pixKeyCpf,
  amount,
  status = 'requested',
  adminId = null,
  createdAt = new Date(),
}) {
  if (!userId || !walletId || !pixKeyCpf || !amount) {
    throw new Error('userId, walletId, pixKeyCpf e amount sao obrigatorios para saques');
  }
  const db = await getDb();
  const withdrawal = {
    _id: randomUUID(),
    userId,
    walletId,
    pixKeyCpf,
    amount,
    status,
    adminId,
    createdAt,
  };
  await db.collection('withdrawals').insertOne(withdrawal);
  return withdrawal;
}

export default clientPromise;
