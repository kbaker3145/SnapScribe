import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import multer from 'multer';
import fs from 'fs';
import { dirname } from "path";
import { fileURLToPath } from "url";
import path from 'path';
import FormData from 'form-data';


const app = express();
const port = 3000;

// app.use(express.static("public")); // express knows where header files are found -- relative file paths



const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(express.static(path.join(__dirname, '/')));


// api data 
const API_URL = "https://api.ocr.space/parse/image";
const apiKey = "K88465533988957"; // TODO is there a way to hide this on github?


/* 
 * Serves the homepage
 */
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// multer = file handling middleware that loads filedata into uploads
const upload = multer({ dest: 'uploads/' });


/* 
 * Handles OCR API call and error catching
 */
app.post('/get-text', upload.single('file'), async (req, res) => {

    console.log('File received:', req.file);  

    const mimeType = req.body.mimeType;  // ADDED Access the MIME type sent from the client

    // if there was no file uploaded
    if (!req.file) {
        return res.status(400).send({ error: 'No file uploaded' });
    }

    try {
        // read the uploaded file
        const filePath = req.file.path;
        const fileData = fs.readFileSync(filePath);

        // convert the file data to base64
        const base64File = fileData.toString('base64');

        // debugging with postman
        // const resultFilePath = path.join(__dirname, 'ocr_result.txt');
        // fs.writeFileSync(resultFilePath, base64File);

        // send to API
        // const ocrResult = await sendToOCR(base64File);

        const ocrResult = await sendToOCR(base64File, mimeType);

        // send text back to the client (index.js)
        res.json({ text: ocrResult });
        
    } catch (error) {
        console.error('Error processing file:', error);
        res.status(500).send({ error: 'Failed to process file' });
    }
});


/* 
 * Handles OCR API call and error catching
 * link for OCR API: https://ocr.space/OCRAPI
 */
async function sendToOCR(base64File, mimeType) { // TODO put the mimetype here to get the right extension 

    // bug fix: ensure that file is sent as "multipart/formdata" to mimic postman trial success
    const formData = new FormData();
    // formData.append('base64Image', `data:application/pdf;base64,${base64File}`); // old one with pdf
    formData.append('base64Image', `data:${mimeType};base64,${base64File}`);
    formData.append('language', 'eng');

    const response = await axios.post(API_URL, formData, {
        headers: {
            ...formData.getHeaders(),  // moves the headers from the form into the api call
            'apikey': apiKey,
        },
    });

    console.log('OCR API response:', response.data); // error checking

    // return the parsed text from the OCR response
    if (response.data && response.data.ParsedResults && response.data.ParsedResults.length > 0) {
        return response.data.ParsedResults[0].ParsedText;
    } else {
        throw new Error('Failed to extract text from the image');
    }
}




// SUMMARIZING TEXT

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MeaningCloud Summarization API URL and API Key
const MEANINGCLOUD_API_URL = 'https://api.meaningcloud.com/summarization-1.0';
const MEANINGCLOUD_API_KEY = '1aafece64575ec01ee34995a66b8c65c';


app.post('/summarize-text', async (req, res) => {

    const { txt, sentences } = req.body;  // Extract the text and sentences from the request body

    console.log("TEXT RECIEVED: ", txt);
    if (!txt) {
      return res.status(400).json({ error: 'No text provided for summarization' });
    }
  
    // Prepare form data for MeaningCloud API
    const formData = new URLSearchParams();
    formData.append('key', MEANINGCLOUD_API_KEY);
    formData.append('txt', txt);
    formData.append('sentences', sentences || '5');  // Default to 5 sentences if not provided
  
    try {
      // Send the request to the MeaningCloud Summarization API
      const response = await fetch(MEANINGCLOUD_API_URL, {
        method: 'POST',
        body: formData,
      });
  
      const result = await response.json();
  
      if (result.status.code !== "0") {
        return res.status(500).json({ error: 'Error summarizing text' });
      }
  
      // Return the summary to the client
      res.json({ text: result.summary });
  
    } catch (error) {
      console.error('Error fetching summary:', error);
      res.status(500).send({ error: 'Failed to fetch summary' });
    }
});
  

// *** CODE FOR SUMMARIZING THE TEXT!! *** (using hugging face transformers)
// https://www.freecodecamp.org/news/how-to-build-a-text-summarizer-using-huggingface-transformers
// 






app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
  


