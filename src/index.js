const express = require('express')
const multer = require('multer')
const axios = require('axios');
const path = require('path')

const upload = multer()
const app = express()

app.use(express.json())

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
    res.render('pages/envio')
})

app.post('/upload-eletrofile', upload.single('eletroFile'), (req, res) => {
    
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Rodando em http://localhost:${PORT}`))