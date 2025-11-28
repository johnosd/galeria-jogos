/**
 * setupDatabase.js - cria/atualiza colecoes com validators e indexes.
 */
const { MongoClient } = require("mongodb");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const dbName = process.env.MONGODB_DB || "ccplay";

async function loadSchema(schemaName) {
  const filepath = path.join(__dirname, "schemas", schemaName);
  const data = fs.readFileSync(filepath, "utf8");
  return JSON.parse(data);
}

async function run() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Conectado ao MongoDB");

    const db = client.db(dbName);

    async function createCollection(name, schema) {
      const exists = await db.listCollections({ name }).toArray();
      const options = {
        validator: { $jsonSchema: schema },
        validationLevel: "moderate",
      };

      if (exists.length === 0) {
        console.log("Criando colecao:", name);
        await db.createCollection(name, options);
      } else {
        console.log("Atualizando validator:", name);
        await db.command({
          collMod: name,
          validator: { $jsonSchema: schema },
          validationLevel: "moderate",
        });
      }
    }

    // 1) Grupos
    const gruposSchema = await loadSchema("grupos.schema.json");
    await createCollection("grupos", gruposSchema);
    await db.collection("grupos").createIndex({ slug: 1 }, { unique: true });
    await db.collection("grupos").createIndex({ adminId: 1 });
    await db.collection("grupos").createIndex({ status: 1 });

    // 2) Users
    const usersSchema = await loadSchema("users.schema.json");
    await createCollection("users", usersSchema);
    await db.collection("users").createIndex({ email: 1 }, { unique: true });
    await db.collection("users").createIndex({ username: 1 }, { unique: true, sparse: true });

    // 3) Membros do grupo
    const membrosSchema = await loadSchema("membrosGrupo.schema.json");
    await createCollection("membrosGrupo", membrosSchema);
    await db.collection("membrosGrupo").createIndex({ grupoId: 1 });
    await db.collection("membrosGrupo").createIndex({ userId: 1 });
    await db.collection("membrosGrupo").createIndex({ grupoId: 1, status: 1 });
    await db.collection("membrosGrupo").createIndex({ grupoId: 1, userId: 1 }, { unique: true });

    console.log("\nBanco configurado com sucesso!");
  } catch (error) {
    console.error("Erro:", error);
  } finally {
    await client.close();
  }
}

run();
