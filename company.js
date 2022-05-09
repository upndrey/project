document.addEventListener("DOMContentLoaded", main);
async function main() {
    const company = new Company();
    let data = await company.getData();

    const content = new Content();
    content.setContent(data);
}

class Company {
    constructor() {
        this.data = [];
    }

    async getData() {
        const params = new Proxy(new URLSearchParams(window.location.search), {
            get: (searchParams, prop) => searchParams.get(prop),
        });
        return await fetch(`http://localhost:3000/getCompany?id=${params.id}`, 
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

class Content {
    constructor() {
        this.dom = document.querySelector(".content");
    }

    setContent(data=null) {
        data = data[0];
        this.dom.classList.add("company__title");
        this.dom.innerHTML = `
            <div>
                <div>Наименование:</div>
                <div>${data['Наименование']}</div>
            </div>
            <div>
                <div>ИНН:</div>
                <div>${data['ИНН']}</div>
            </div>
            <div>
                <div>Почтовый адрес:</div>
                <div>${data['Почтовый адрес']}</div>
            </div>
            <div>
                <div>Юридический адрес:</div>
                <div>${data['Юридический адрес']}</div>
            </div>
            <div>
                <div>КПП:</div>
                <div>${data['КПП']}</div>
            </div>
            <div>
                <div>Расчетный счет:</div>
                <div>${data['Расчетный счет']}</div>
            </div>
            <div>
                <div>БИК:</div>
                <div>${data['БИК']}</div>
            </div>
            <div>
                <div>ОКПО:</div>
                <div>${data['ОКПО']}</div>
            </div>
        `;
    }
};

