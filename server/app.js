const express = require('express')
const cors = require('cors');
const path = require('path');
const app = express()
const port = 3000
const Query = require('./query');

app.use(cors());

// to support JSON-encoded bodies
app.use(express.json());       
// to support URL-encoded bodies
app.use(express.urlencoded()); 

app.get('/getAllContracts', async (req, res) => {
    let contracts = await Query.selectAllFromTable("договор");
    let orgs = [];
    let stages = [];
    for(let i = 0; i < contracts.length; i++) {
        let temp = await Query.selectFromTable(`\`организация\``, "*", `\`Номер организации\`=${contracts[i]['Номер организации']}`);
        orgs.push(temp);
        contracts[i].stages = await Query.selectFromTable(`\`этап договора\``, "*", `\`Номер договора\`=${contracts[i]['Номер договора']}`);
        
        let summary = 0;
        contracts[i].stages.forEach((stage) => {
            summary += stage['Сумма'];
        });

        contracts[i]['Сумма'] = summary;
    }
    let result = {
        'contracts': contracts,
        'orgs': orgs
    }


    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(result));
});

app.get('/getCompany', async (req, res) => {
    let org = await Query.selectFromTable(`\`организация\``, "*", `\`Номер организации\`=${req.query.id}`);
    
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(org));
});

app.get('/getStages', async (req, res) => {
    let contract = await Query.selectFromTable(`\`договор\``, "*", `\`Номер договора\`=${req.query.id}`);
    contract = contract[0];
    contract.stages = await Query.selectFromTable(`\`этап договора\``, "*", `\`Номер договора\`=${req.query.id}`);

    let summary = 0;
    contract.stages.forEach((stage) => {
        summary += stage['Сумма'];
    });

    contract['Сумма'] = summary;


    let temp = await Query.selectFromTable(`\`организация\``, "*", `\`Номер организации\`=${contract['Номер организации']}`);
    contract.orgName = temp[0]['Наименование'];
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(contract));
});



// Слушаем порт для локального сервера
app.listen(port, () => {
    console.log("server started on ", port);
})