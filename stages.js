document.addEventListener("DOMContentLoaded", main);
async function main() {
    const stages = new Stages();
    const table = new Table();
    const controls = new Controls(stages, table);
    if(!controls.minDateDom) {
        let data = await stages.getData();
        table.generateTable(data);
    }
    else {
        let data = await stages.getData(1);
        table.generateTable(data);
    }
}

class Stages {
    constructor() {
        this.data = [];
    }

    async getData(id=null) {
        let resultId;
        if(!id) {
            const params = new Proxy(new URLSearchParams(window.location.search), {
                get: (searchParams, prop) => searchParams.get(prop),
            });
    
            resultId = params.id;
        }
        else {
            resultId = id;
        }
        return await fetch(`http://localhost:3000/getStages?id=${resultId}`, 
            { 
                method: 'GET'
            }
        )
        .then((res) => {return res.json(); })
        .then(
            (res) => {
                return res;
            }
        );
    }
}

class Controls {
    constructor(stages, table, data=null) {
        this.selectDDom = document.getElementById("selectD");
        this.minDateDom = document.getElementById("minDate");
        this.maxDateDom = document.getElementById("maxDate");
        this.isDoneDom = document.getElementById("isDone");
        this.clearFilterDom = document.getElementById("clearFilter");
        this.data = data;
        this.table = table;
        this.filter = {
            'minDateFilter': null, 
            'maxDateFilter': null, 
            'isDoneFilter': null
        };

        if(!this.minDateDom)
            return;

        (async function() {
            let result = await fetch('http://localhost:3000/getAllContracts', 
                { 
                    method: 'GET'
                }
            )
            .then((res) => {return res.json(); })
            .then(
                (res) => {
                    return res;
                }
            );

            let {contracts, orgs} = result;
            console.log(contracts);
            contracts.forEach((row, i) => {
                let optionDom = document.createElement("option");
                optionDom.value = row['Номер договора'];
                optionDom.innerText = `${row['Наименование договора']} | ${orgs[i][0]['Наименование']}`;
                this.selectDDom.appendChild(optionDom);
            })
        }.call(this));
            
        this.selectDDom.addEventListener("input", async (e) => {
            data = await stages.getData(e.target.value)
            table.generateTable(data, this.filter);
        });
        
        this.minDateDom.addEventListener("input", (e) => {
            this.filter.minDateFilter = new Date(e.target.value);
            table.generateTable(data, this.filter);
        });

        this.maxDateDom.addEventListener("input", (e) => {
            this.filter.maxDateFilter = new Date(e.target.value);
            table.generateTable(data, this.filter);
        });

        this.isDoneDom.addEventListener("input", (e) => {
            this.filter.isDoneFilter = e.target.value;
            table.generateTable(data, this.filter);
        });

        this.clearFilterDom.addEventListener("click", (e) => {
            this.filter = {
                'minDateFilter': null, 
                'maxDateFilter': null, 
                'isDoneFilter': null
            };
            table.generateTable(data, this.filter);
        });
    }


}

class Table {
    constructor() {
        this.dom = document.querySelector(".content");
        this.additionalDom = document.querySelector(".additional");
    }

    generateTable(data=[], filter={'minDateFilter':null, 'maxDateFilter':null, 'isDoneFilter': null}) {
        this.setTitle();
        this.setContent(data, filter);
        this.setAdditional(data);
    }

    setTitle() {
        this.dom.innerHTML = ``;
        let rowDom = document.createElement("tr");
        rowDom.innerHTML += `
            <tr>
                <th>Факт выполнения</th>
                <th>Наименование</th>
                <th>Дата заключения договора</th>
                <th>Крайний срок выполнения</th>
                <th>Сумма</th>
            </tr>
        `;
        this.dom.appendChild(rowDom);
    }

    setContent(data=[], filter) {
        const {minDateFilter, maxDateFilter, isDoneFilter} = filter;
        data.stages.forEach(row => {
            let date = new Date(row['Дата начала выполнения']);
            let dateEnd = new Date(row['Крайний срок выполнения']);


            let today = new Date();
            let isContractDone = new Date(row['Крайний срок выполнения']) < today;
            let contractDoneValue = isContractDone ? 'Выполнен' : 'Не выполнен';


            if(minDateFilter && date <= minDateFilter)
                return;
            if(minDateFilter && dateEnd <= minDateFilter)
                return;
            if(maxDateFilter && date >= maxDateFilter)
                return;
            if(maxDateFilter && dateEnd >= maxDateFilter)
                return;
            if(
                isDoneFilter && 
                (
                    isDoneFilter == 'Не Выполненные' && 
                    contractDoneValue == 'Выполнен' ||
                    isDoneFilter == 'Выполненные' &&
                    contractDoneValue == 'Не выполнен'
                )
            )
                return;

            let rowDom = document.createElement("tr");
            rowDom.innerHTML =  `
                <tr>
                    <td>${contractDoneValue}</td>
                    <td>${row['Наименование этапа']}</td>
                    <td>${date.getDate() < 10 ? '0'+date.getDate() : date.getDate()}.${date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1}.${date.getFullYear()}</td>
                    <td>${dateEnd.getDate() < 10 ? '0'+dateEnd.getDate() : dateEnd.getDate()}.${dateEnd.getMonth() + 1 < 10 ? '0' + (dateEnd.getMonth() + 1) : dateEnd.getMonth() + 1}.${dateEnd.getFullYear()}</td>
                    <td>${row['Сумма']}&nbsp;руб.</td>
                </tr>
            `;
            this.dom.appendChild(rowDom);
        });
    }

    setAdditional(data=[]) {
        if(data.length)
            return;

        let date = new Date(data['Дата заключения договора']);
        this.additionalDom.innerHTML = `
            <div>
                <div>Наименование компании:</div>
                <div><a href="/company.html?id=${data['Номер организации']}">${data['orgName']}</a></div>
            </div>
            <div>
                <div>Наименование договора:</div>
                <div>${data['Наименование договора']}</div>
            </div>
            <div>
                <div>Дата заключения договора:</div>
                <div>${date.getDate() < 10 ? '0'+date.getDate() : date.getDate()}.${date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1}.${date.getFullYear()}</div>
            </div>
            <div>
                <div>Сумма:</div>
                <div>${data['Сумма']}&nbsp;руб.</div>
            </div>
        `;
    }
};

