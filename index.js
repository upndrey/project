document.addEventListener("DOMContentLoaded", main);
async function main() {
    const contracts = new Contracts();
    let data = await contracts.getData();
    const table = new Table();
    table.generateTable(data);
    const controls = new Controls(table, data);
}

class Contracts {
    constructor() {
        this.data = [];
    }

    async getData() {
        return await fetch('http://localhost:3000/getAllContracts', 
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
    constructor(table, data) {
        this.minDateDom = document.getElementById("minDate");
        this.maxDateDom = document.getElementById("maxDate");
        this.isDoneDom = document.getElementById("isDone");
        this.clearFilterDom = document.getElementById("clearFilter");
        this.filter = {
            'minDateFilter': null, 
            'maxDateFilter': null, 
            'isDoneFilter': null
        };

        if(!this.minDateDom)
            return;
        
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
    }

    generateTable(data=[], filter={'minDateFilter':null, 'maxDateFilter':null, 'isDoneFilter': null}) {
        this.setTitle();
        this.setContent(data, filter);
    }

    setTitle() {
        this.dom.innerHTML = ``;
        let rowDom = document.createElement("tr");
        rowDom.innerHTML += `
            <tr>
                <th>Факт выполнения</th>
                <th>Организация</th>
                <th>Наименование</th>
                <th>Дата заключения</th>
                <th>Сумма</th>
            </tr>
        `;
        this.dom.appendChild(rowDom);
    }

    setContent(data, filter) {
        const {minDateFilter, maxDateFilter, isDoneFilter} = filter;

        data.contracts.forEach((row, i) => {
            let rowDom = document.createElement("tr");
            let date = new Date(row['Дата заключения договора']);

            let today = new Date();
            let isContractDone = row.stages.every(stage => {
                return new Date(stage['Крайний срок выполнения']) < today;
            })
            let contractDoneValue = isContractDone ? 'Выполнен' : 'Не выполнен';


            if(minDateFilter && date <= minDateFilter)
                return;
            if(maxDateFilter && date >= maxDateFilter)
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
            
            rowDom.innerHTML =  `
                <tr>
                    <td>${contractDoneValue}</td>
                    <td><a href="/company.html?id=${row['Номер организации']}">${data.orgs[i][0]['Наименование']}</a></td>
                    <td><a href="/stages.html?id=${row['Номер договора']}">${row['Наименование договора']}</a></td>
                    <td>${date.getDate() < 10 ? '0'+date.getDate() : date.getDate()}.${date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1}.${date.getFullYear()}</td>
                    <td>${row['Сумма']}&nbsp;руб.</td>
                </tr>
            `;
            this.dom.appendChild(rowDom);
        });
    }

    
};

