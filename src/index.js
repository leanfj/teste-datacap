require('dotenv').config()

const express = require('express')
const multer = require('multer')
const axios = require('axios');
const path = require('path');
const FromData = require('form-data')
const fs = require('fs')
const {MongoClient} = require('mongodb');

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

    form.append('my_file', fs.createReadStream(path.resolve(__dirname, '..', 'uploads', req.file.originalname)));

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

    form.append('my_file', fs.createReadStream(path.resolve(__dirname, '..', 'uploads', req.file.originalname)));

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

    form.append('my_file', fs.createReadStream(path.resolve(__dirname, '..', 'uploads', req.file.originalname)));

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

app.post('/receive-data', (req, res) => {

    async function main(){

        const uri = process.env.MONGODB_URI;

        const client = new MongoClient(uri);
    
        try {
            await client.connect();
    
            const result = await createData(client,
                req.body
            );

            res.send(result)

      
           
        } finally {
            // Close the connection to the MongoDB cluster
            await client.close();
        }
    }
    
    main().catch(console.error);
    

    async function createData(client, newListing){
        const result = await client.db("readData").collection(newListing.layoutName).insertOne(newListing);
        console.log(`Created id: ${result.insertedId}`);
    }

})


app.post('/receive-vivo-data', (req, res) => {

    async function main(){

        const uri = process.env.MONGODB_URI;

        const client = new MongoClient(uri);
    
        try {
            await client.connect();
    
            const result = await createData(client,
                req.body
            );

            res.send(result)

      
           
        } finally {
            // Close the connection to the MongoDB cluster
            await client.close();
        }
    }
    
    main().catch(console.error);
    

    async function createData(client, newListing){
        const result = await client.db("readData").collection(newListing.documentName).insertOne(newListing);
        console.log(`Created id: ${result.insertedId}`);
    }

})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Rodando em http://localhost:${PORT}`))