const { getCollections } = require("./lib/api/services");

async function test() {
  try {
    const cols = await getCollections();
    console.log(JSON.stringify(cols, null, 2));
  } catch (e) {
    console.error(e);
  }
}

test();
