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
        const ocrResult = await sendToOCR(base64File);

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
async function sendToOCR(base64File) {

    // bug fix: ensure that file is sent as "multipart/formdata" to mimic postman trial success
    const formData = new FormData();
    formData.append('base64Image', `data:application/pdf;base64,${base64File}`);
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



// *** CODE FOR SUMMARIZING THE TEXT!! *** (using hugging face transformers)
// https://www.freecodecamp.org/news/how-to-build-a-text-summarizer-using-huggingface-transformers/


// 






app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
  


