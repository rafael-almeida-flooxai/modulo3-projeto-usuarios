class UserController {

    constructor(formIdCreate, formIdUpdate, tableId) {

        this.formEl = document.getElementById(formIdCreate);
        this.formUpdateEl = document.getElementById(formIdCreate);
        this.tableEl = document.getElementById(tableId);

        this.onSubmit();
        this.onEdit();

    }

    onEdit() {
        document.querySelector("#box-user-update .btn-cancel").addEventListener("click", e => {

            this.showPanelCreate();

        });

        this.formUpdateEl.addEventListener("submit", event => {

            event.preventDefault();

            let btn = this.formUpdateEl.querySelector("[type=submit]");

            btn.disabled = true;

            let values = this.getValues(this.formUpdateEl);

            let index = form.formUpdateEl.dataset.trIndex;

            let tr = this.tableEl.rows[index];

            let userOld = JSON.parse(tr.dataset.user);

            let result = Object.assign({}, userOld, values)

            this.getPhoto(this.formUpdateEl).then
                ((content) => {

                    if (!values.photo) {
                        result._photo = userOld._photo;
                    } else {
                        result._photo = content;
                    }

                    tr.dataset.user = JSON.stringify();

                    tr.innerHTML = `
                <td><img src="${values._photo}" alt="User Image" class="img-circle img-sm"></td>
                <td>${values._name}</td>
                <td>${values._email}</td>
                <td>${(values._admin) ? 'Sim' : 'Não'}</td>
                <td>${Utils.dateFormat(values._register)}</td>
                <td>
                <button type="button" class="btn btn-primary btn-edit btn-xs btn-flat">Editar</button>
                <button type="button" class="btn btn-danger btn-xs btn-flat">Excluir</button>
            </td>
        `;

                    this.addEventsTr();
                    this.updateCount();

                    this.formUpdateEl.reset();

                    btn.disabled = false;

                    this.showPanelCreate();

                },
                    (e) => {

                        console.error(e);

                    });


        })

    }

    onSubmit() {

        this.formEl.addEventListener("submit", event => {

            event.preventDefault();

            let btn = this.formEl.querySelector("[type=submit]");

            btn.disabled = true;

            let values = this.getValues(this.formEl);

            if (!values) {
                btn.disabled = false; // ← reabilita o botão
                return false;
            }

            this.getPhoto(this.formEl).then
                ((content) => {

                    values.photo = content;

                    this.addLine(values);

                    this.formEl.reset();

                    btn.disabled = false;

                },
                    (e) => {

                        console.error(e);

                    });
        });

    }

    getPhoto(callback) {

        return new Promise((resolve, reject) => {

            let fileReader = new FileReader();

            let elements = [...this.formEl.elements].filter(item => {

                if (item.name === 'photo') {
                    return item;
                }
            });

            let file = elements[0].files[0];

            fileReader.onload = () => {

                resolve(fileReader.result);

            };

            fileReader.onerror = (e) => {

                reject(e);

            }

            if (file) {
                fileReader.readAsDataURL(file);
            } else {
                resolve('dist/img/boxed-bg.jpg');
            }
        });
    }

    getValues() {

        let user = {};
        let isValid = true;

        // limpa erros anteriores
        [...this.formEl.elements].forEach(field => {
            field.parentElement.classList.remove('has-error');
        });

        [...this.formEl.elements].forEach(function (field, index) {
            if (['name', 'email', 'password'].indexOf(field.name) > -1 && !field.value) {
                field.parentElement.classList.add('has-error');
                isValid = false;
            }

            if (field.name == "gender") {
                if (field.checked) {
                    user[field.name] = field.value;
                }

            } else if (field.name == "admin") {
                user[field.name] = field.checked;

            } else {
                user[field.name] = field.value;
            }
        });

        if (!isValid) {
            return false;
        }

        return new User(
            user.name,
            user.gender,
            user.birth,
            user.country,
            user.email,
            user.password,
            user.photo,
            user.admin
        );

    }

    insert(data) {

              let users = [];

        if (sessionStorage.getItem("users")) {

            users = JSON.parse(sessionStorage.getItem("users"));

        }

  

        users.push(data);

        sessionStorage.setItem("user", JSON.stringify(users)); 

    }

    addLine(dataUser) {

        let tr = document.createElement('tr');

        this.insert();

        tr.dataset.user = JSON.stringify(dataUser);

        tr.innerHTML = `
                <td><img src="${dataUser.photo}" alt="User Image" class="img-circle img-sm"></td>
                <td>${dataUser.name}</td>
                <td>${dataUser.email}</td>
                <td>${(dataUser.admin) ? 'Sim' : 'Não'}</td>
                <td>${Utils.dateFormat(dataUser.register)}</td>
                <td>
                <button type="button" class="btn btn-primary btn-edit btn-xs btn-flat">Editar</button>
                <button type="button" class="btn btn-danger btn-delete btn-xs btn-flat">Excluir</button>
            </td>
    `;

        this.addEventsTr(tr);

        this.tableEl.appendChild(tr);

        this.updateCount();

    }

    addEventsTr(tr) {

        tr.querySelector(".btn-delete").addEventListener("click", e => {

            if (confirm("Deseja realmente excluir?")) {

                tr.remove(); 

                this.updateCount(); 

            } else {

            }

        })

            tr.querySelector(".btn-edit").addEventListener("click", e => {

                let json = JSON.parse(tr.dataset.user);

                this.formUpdateEl.dataset.trIndex = tr.sectionRowIndex;

                for (let name in json) {

                    let field = this.formUpdateEl.querySelector("[name=" + name.replace("_", "") + "]")



                    if (field) {

                        if (field.type == 'file') continue;

                        switch (field.type) {
                            case 'file':
                                continue;
                                break;

                            case 'radio':
                                field = form.querySelector("[name=" + name.replace("_", "") + "][value=" + json[name] + "]");
                                if (field) {
                                    field.checked = true;
                                } else {
                                    console.warn(`Campo do tipo radio não encontrado para name=${name} e value=${json[name]}`);
                                }
                                break;

                            case 'checkbox':
                                field.checked = json[name];
                                break;

                            default:
                                field.value = json[name];
                                break;
                        }

                    }

                }

                this.formUpdateEl.querySelector(".photo").src = json._photo;

                this.showPanelUpdate();

            })
        }

    showPanelCreate() {
            document.querySelector("#box-user-create").style.display = "block";
            document.querySelector("#box-user-update").style.display = "none";
        }

    showPanelUpdate() {
            document.querySelector("#box-user-create").style.display = "none";
            document.querySelector("#box-user-update").style.display = "block";
        }

    updateCount() {

            let numberUsers = 0;
            let numberAdmin = 0;

            [...this.tableEl.children].forEach(tr => {

                numberUsers++;

                console.log

                try {
                    if (!tr.dataset.user) return;
                    let user = JSON.parse(tr.dataset.user);
                    if (user._admin) numberAdmin++;
                } catch (e) {
                    console.warn('Erro ao interpretar dados do usuário:', e);
                }

            });

            document.querySelector("#number-users").innerHTML = numberUsers;
            document.querySelector("#number-users-admin").innerHTML = numberAdmin;

        }

}