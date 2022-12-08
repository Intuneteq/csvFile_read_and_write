const express = require("express");
const fs = require("fs");
const cors = require("cors");
const crypto = require("crypto");
const csvtojson = require("csvtojson");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const app = express();
const PORT = process.env.PORT || 3000;
app.use(
  cors({
    origin: "*",
  })
);

//step by step script
//1. create a chip-0007 format json file for each row in the teams.csv file and name them nft{nftname}.json
//2. calculate the hash value for each json file using SHA-256 and store in a new csv file
//3. append the old csv file with the new csv file such that each row has it's hash value

const csvFilePath = "./csv/teams.csv"; //file path for csv from teams
const csvWriter = createCsvWriter({
  //function to push hash values into a csv file
  path: "./csv/hashValues.csv", // defined path for about to be generated hash values
  header: [{ id: "hash", title: "HASH" }], //defining csv file schema for the hash values
});

// const appendWriter =

const handleCvs = async () => {
   csvtojson() //using csvtojson package to convert my csv file to json
    .fromFile(csvFilePath)
    .then((json) => {
      //   console.log(json);
      json.forEach((item) => {
        fs.writeFileSync(
          `./output/nft${item.Filename}.json`, //handling each json file separately enforcing chip-0007 format and storing in output folder
          JSON.stringify({
            format: "CHIP-0007",
            minting_tool: "SuperMinter/2.5.2",
            sensitive_content: false,
            ...item,
            attributes: [
              {
                trait_type: "Species",
                value: "Mouse",
              },
              {
                trait_type: "Color",
                value: "Yellow",
              },
              {
                trait_type: "Friendship",
                value: 50,
                min_value: 0,
                max_value: 255,
              },
            ],
            collection: {
              name: "Example Pokémon Collection",
              id: "e43fcfe6-1d5c-4d6e-82da-5de3aa8b3b57",
              attributes: [
                {
                  type: "description",
                  value:
                    "Example Pokémon Collection is the best Pokémon collection. Get yours today!",
                },
                {
                  type: "icon",
                  value: "https://examplepokemoncollection.com/image/icon.png",
                },
                {
                  type: "banner",
                  value:
                    "https://examplepokemoncollection.com/image/banner.png",
                },
                {
                  type: "twitter",
                  value: "ExamplePokemonCollection",
                },
                {
                  type: "website",
                  value: "https://examplepokemoncollection.com/",
                },
              ],
            },
          }),
          "utf-8",
          (err) => {
            if (err) console.log(err); //if err, console.log error
          }
        );
      });
    });
  //step 2: now that we have our nft json files in the output directory, calculate the hash values using SHA-256
  const outputFolder = "./output"; //Declaring my output directory so i can iterate through it and hash each of them
  let hexArray = []; //hashed values will be stored here
  fs.readdirSync(outputFolder).forEach((file) => {
    //looping through the output directory
    const hashValue = crypto.createHash("sha256"); //creating my hash function
    const fileBuffer = fs.readFileSync(outputFolder + "/" + file);
    const finalHex = hashValue.update(fileBuffer).digest("hex"); //hashed values
    // console.log(finalHex);
    hexArray.push(finalHex); //storing my hashed values in the predefined array
  });
  //   console.log(hexArray);
  //now we push the array into a csv file
  const records = hexArray.map((item) => {
    //New array with defined csv structure
    return { hash: item };
  });



  //   console.log(records);
  csvWriter.writeRecords(records).then(() => {
    //pushing array into csv file
    console.log("..Done");
  });

  //step3: appending old csv file from team with the hashed values
  const originalData = await csvtojson().fromFile(csvFilePath);

  const dataWithHash = originalData.map((item, index) => {
    return {...item, hash: hexArray[index]}
  })
  console.log(dataWithHash);


};

handleCvs();

app.get("/", (req, res) => {
  res.send(jsonContent);
});

app.listen(PORT, () => {
  console.log(`app running on port ${PORT}`);
});
