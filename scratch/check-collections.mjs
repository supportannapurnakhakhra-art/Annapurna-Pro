import { getCollections } from "../lib/api/services.js";
import dotenv from "dotenv";
dotenv.config({ path: "../.env.local" });

async function test() {
  try {
    const cols = await getCollections();
    console.log(JSON.stringify(cols, null, 2));
  } catch (e) {
    console.error(e);
  }
}

test();
