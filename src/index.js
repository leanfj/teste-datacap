require('dotenv').config()

const express = require('express')
const multer = require('multer')
const axios = require('axios')
const path = require('path')
const FromData = require('form-data')
const fs = require('fs')
const { MongoClient } = require('mongodb')


const { FormRecognizerClient, AzureKeyCredential } = require("@azure/ai-form-recognizer");


const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'uploads/')
    },

    filename: (req, file, callback) => {
        callback(null, `${file.originalname}`)
    }
})

const upload = multer({ storage })


const app = express()

app.use(express.json({limit: '50mb'}))

app.use(express.static('public'))

app.set('view engine', 'ejs')
app.set('views', './views')

app.get('/', (req, res) => {
    res.render('pages/index')
})

app.get('/consulta', (req, res) => {
    res.render('pages/consulta', { dados: [], trackingcode: '' })
})

app.get('/consulta-envio', (req, res) => {

    axios.get(`http://lis.leega.com.br/Documento/${req.query.trackingcode}/ObterInfo`).
        then((response) => {
            res.render('pages/consulta', {
                dados: response.data,
                trackingcode: req.query.trackingcode
            })
        })

})

app.get('/envio', (req, res) => {
    res.render('pages/envio', {data: ''})
})

app.post('/upload-eletrofile', upload.single('eletroFile'), (req, res) => {

    const form = new FromData()

    form.append('my_file', fs.createReadStream(path.resolve(__dirname, '..', 'uploads', req.file.originalname)))

    axios.post('http://lis.leega.com.br/Emissor/2/TipoDocumento/2/Upload/1', form, {
        headers: {
            ...form.getHeaders()
        }
    }).then(
        response => {
            fs.unlink(path.resolve(__dirname, '..', 'uploads', req.file.originalname), (err) => {
                console.log('File removed')
            })
            res.render('pages/consulta', {trackingcode: response.data[0], dados: []})
        }
    )

})

app.post('/upload-waterfile', upload.single('waterFile'), (req, res) => {

    const form = new FromData()

    form.append('my_file', fs.createReadStream(path.resolve(__dirname, '..', 'uploads', req.file.originalname)))

    axios.post('http://lis.leega.com.br/Emissor/3/TipoDocumento/3/Upload/1', form, {
        headers: {
            ...form.getHeaders()
        }
    }).then(
        response => {
            fs.unlink(path.resolve(__dirname, '..', 'uploads', req.file.originalname), (err) => {
                console.log('File removed')
            })
            res.render('pages/consulta', {trackingcode: response.data[0], dados: []})
        }
    )

})

app.post('/upload-servicefile', upload.single('serviceFile'), (req, res) => {

    const form = new FromData()

    form.append('my_file', fs.createReadStream(path.resolve(__dirname, '..', 'uploads', req.file.originalname)))

    axios.post('http://lis.leega.com.br/Emissor/1/TipoDocumento/5/Upload/1', form, {
        headers: {
            ...form.getHeaders()
        }
    }).then(
        response => {
            fs.unlink(path.resolve(__dirname, '..', 'uploads', req.file.originalname), (err) => {
                console.log('File removed')
            })
            res.render('pages/consulta', {trackingcode: response.data[0], dados: []})
        }
    )

})

app.post('/upload-vivo', upload.single('serviceFile'), async (req, res) => {
    const endpoint = "https://vivo.cognitiveservices.azure.com/";
    const apiKey = "abf7c6975a584c0b9ffc46070370cd00";
    const modelId = "1461b08f-c2ed-4d63-820a-e493d2402cd6";

    let fileStream = fs.createReadStream(path.resolve(__dirname, '..', 'uploads', req.file.originalname))

    const client = new FormRecognizerClient(
        endpoint,
        new AzureKeyCredential(apiKey)
    )

    const poller = await client.beginRecognizeCustomForms(modelId, fileStream, {
        contentType: "application/pdf",
        onProgress: (state) => {
          console.log(`status: ${state.status}`);
        },
      }); 

    const forms = await poller.pollUntilDone()

    fs.unlink(path.resolve(__dirname, '..', 'uploads', req.file.originalname), (err) => {
        console.log('File removed')
    })

    async function main(){

        const uri = process.env.MONGODB_URI

        const client = new MongoClient(uri)
    
        try {
            await client.connect()
    
            const result = await createData(client,
                forms
            )

            res.send(result)
           
        } finally {
            // Close the connection to the MongoDB cluster
            await client.close()
        }
    }
    
    main().catch(console.error)    

    async function createData(client, newListing){
        const result = await client.db("readData").collection("VIVO_formRecognizer").insertOne(forms)
        console.log(`Created id: ${result.insertedId}`)
    }


})

app.post('/receive-data', (req, res) => {

    async function main(){

        const uri = process.env.MONGODB_URI

        const client = new MongoClient(uri)
    
        try {
            await client.connect()
    
            const result = await createData(client,
                req.body
            )

            res.send(result)

      
           
        } finally {
            // Close the connection to the MongoDB cluster
            await client.close()
        }
    }
    
    main().catch(console.error)
    

    async function createData(client, newListing){
        const result = await client.db("readData").collection(newListing.layoutName).insertOne(newListing)
        console.log(`Created id: ${result.insertedId}`)
    }

})

app.post('/receive-vivo-data', (req, res) => {

    async function main(){

        const uri = process.env.MONGODB_URI

        const client = new MongoClient(uri)
    
        try {
            await client.connect()
    
            const result = await createData(client,
                req.body
            )

            res.send(result)

      
           
        } finally {
            // Close the connection to the MongoDB cluster
            await client.close()
        }
    }
    
    main().catch(console.error)
    

    async function createData(client, newListing){
        const result = await client.db("readData").collection(newListing.documentName).insertOne(newListing)
        console.log(`Created id: ${result.insertedId}`)
    }

})

app.get('/get-data', async (req, res) => {
    
    const uri = process.env.MONGODB_URI
    const client = new MongoClient(uri);

    await client.connect()

    const db = client.db('readData')
    const collection = db.collection(req.body.documentName)
    
    collection.find({}).toArray((err, data) => {     

        const result = data.map(item => {
            
            const fields = item.results.fields
            let fieldsResult = {}
            for (const key in fields) {
                if (Object.hasOwnProperty.call(fields, key)) {
                    
                    if (key != "@odata.type") {
                        const element = fields[key];
                        fieldsResult[key] = element.valueText
                    }
                    
                }
            }

            const itemsTable = item.results.items
            let itemsTableResult = itemsTable.map(itemTable => {
                const fields = itemTable.fields
                let fieldsResult = {}
                for (const key in fields) {
                    if (Object.hasOwnProperty.call(fields, key)) {
                        
                        if (key != "@odata.type") {
                            const element = fields[key];
                            fieldsResult[key] = element.valueText
                        }
                        
                    }
                }
                return {
                    fields: fieldsResult
                }
            })

            return { fields: fieldsResult, table: itemsTableResult}
        })

        res.json(result)
        client.close()
    })
    
    
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Rodando em http://localhost:${PORT}`))