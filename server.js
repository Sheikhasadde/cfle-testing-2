// mongodb-client-encryption uuid-base64
const { ClientEncryption } = require("mongodb-client-encryption");
const base64 = require("uuid-base64");
const mongoose = require("mongoose");
const express = require("express");
const app = express();
"./"

const server = app.listen(process.env.PORT || 5000, () => {
  console.log("Server running on /" + server);
});

function getEncryptionKey() {
  const arr = [];
  for (let i = 0; i < 96; ++i) {
    arr.push(i);
  }
  const key = Buffer.from(arr);

  return key;
}

const key = getEncryptionKey();
const keyVaultNamespace = "client.encryption";
const kmsProviders = { local: { key } };
const URL =
  "mongodb+srv://sqQh:sqQh726G398RCyP1@switcheroodevelopment.7d3a1.mongodb.net/test?retryWrites=true&w=majority";

const autoEncryption = {
  keyVaultNamespace,
  kmsProviders,
  extraOptions: { mongocryptdSpawnPath: "./mongobins/mongocryptd" },
};

async function main() {
  await mongoose.connect(URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // Configure auto encryption
    autoEncryption,
  });

  // const { ClientEncryption } = new Encrypt(require('mongodb'));
  const encryption = new ClientEncryption(mongoose.connection.client, {
    keyVaultNamespace,
    kmsProviders,
  });

  const __key__ = await encryption.createDataKey("local");
  await mongoose.connection.dropCollection("keys").catch(() => {});
  await mongoose.connection.createCollection("keys", {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        properties: {
          name: {
            encrypt: {
              bsonType: "string",
              keyId: [__key__],
              algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
            },
          },
        },
      },
    },
  });

  const Model = mongoose.model("keys", mongoose.Schema({ name: String }));
  await Model.create({ name: "testing" });
}

main().then(console.log("Server is running...!")).catch(console.log);
