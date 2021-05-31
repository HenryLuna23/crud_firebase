//despues de haber importado el firestore hacemos la creaion con la db
const db = firebase.firestore();

//document.querySelector("#task-form"); //seleccionando el elemento con el id
const taskForm = document.getElementById("task-form");
//seleccionando el elemento donde veremos los datos
const taskContainer = document.getElementById("task-container");

//variable para saber cuando se esta edtando o agregando una nueva tarea
let editStatus = false;
let id = ""; //contendra el id  a actualizar en el momento que se necesite

const saveTask = (title, description) =>
  db.collection("tasks").doc().set({
    title: title,
    description: description,
  }); //en la db crearemos una coleccion con el nombre,guardamos un solo documento ,y lo que guardaremos dentro de ese doc sera un objeto con las propiedades y su valor
//la creacion de la coleccion es una peticion asincrona una vez termine de guardar nos pedira una respuesta
//para el envio de resp se puede usar callbacks, promesas o asynawait

//funcion para obtener todos los datos de la db
const getTask = () => db.collection("tasks").get(); //desde la db la coleccion llamada task
//quien es que carga la app la ventana entonces no mas inicie debe de llamar los datos para mostrarlos

const onGetTask = (callback) => db.collection("tasks").onSnapshot(callback); //de la collecion de la tarea cada vez que un dato cambie vamos a manejarlo con una funcion

const deleteTask = (id) => db.collection("tasks").doc(id).delete();

//actualizacion de la tarea
const updateTask = (id, updateTask) =>
  db.collection("tasks").doc(id).update(updateTask); //necesitamos el id de la tarea a actualizar y los nuevos datos de esa tarea

//para obtener la tarea a editar
const getTaskEdit = (id) => db.collection("tasks").doc(id).get(); //de la coleccion quiero obtener un documento con el id que te paso y obtenerlo

//para eliminar una tarea necesito un id y una vez tenemos el id debemos darselo a firebase

//
window.addEventListener("DOMContentLoaded", async (e) => {
  //1-cuando cargue el navegador
  // const querySnapshot = await getTask();//esto no importaria al agregar el ongettask

  onGetTask((querySnapshot) => {
    //agregamos un escucha al navegador el onGetTask viene desde firebase el nos dara un dato cada vez que cambie
    //cuado cambien datos lo recibimos en un objeto llamado querySnapshot y alli estaran todos los datos
    taskContainer.innerHTML = ""; //limpiamos el contenedor de las tareas para que no se duplique los datos
    querySnapshot.forEach((doc) => {
      //y lo comenzamos recorrer si se crea,edita o elimina una tarea se ejecuta esto
      //console.log(doc.data());

      const task = doc.data(); //el metodo data nos devuelve los resultados de los datos menos el id
      task.id = doc.id;
      //console.log(task);
      taskContainer.innerHTML += `<div class="card card-body mt-2 border-primary">
      <h3 class="h5"> ${task.title} </h3>
      <p> ${task.description} </p>
        <div>
          <button class="btn btn-primary btn_delete" data-id="${task.id}">Delete</button>
          <button class="btn btn-secondary btn_edit" data-id="${task.id}">Edit</button>    
        </div>
      </div>`;

      //asignamos la clase btn_delete
      const btns_delete = document.querySelectorAll(".btn_delete"); //quiero que selecciones todos los elementos que tienen la clase btn_delete
      btns_delete.forEach((btn) => {
        //recorremos cada boton y por cada boton le agregamos un escucha en su evento click
        btn.addEventListener("click", async (e) => {
          //cuando se le de click q muestre por consola
          //console.log(e.target.dataset.id);
          await deleteTask(e.target.dataset.id);
        });
      });

      //EDITAR
      const btns_edit = document.querySelectorAll(".btn_edit");
      btns_edit.forEach((btn) => {
        btn.addEventListener("click", async (e) => {
          //console.log(e.target.dataset.id);
          const doc = await getTaskEdit(e.target.dataset.id); //obtenemos el registro que queremos y para mostrarlo llamamos a la variable .data()
          //mandando los datos obtenidos al formulario
          const task = doc.data();
          taskForm["task-title"].value = task.title;
          taskForm["task-description"].value = task.description;
          editStatus = true;
          id = doc.id;
          taskForm["btn-task-form"].innerText = "Update";
        });
      });
    });
  });
  //console.log(querySnapshot);
}); //cuando el dom haya cargado el contenido quiero que se dispare un evento

//aca es no mas se inicia la aplicacion entonces hacemos validacion para saber si estamos editando o agregando

taskForm.addEventListener("submit", async (e) => {
  e.preventDefault(); //con esto hacemos que no se refresque la pagina cada ves que se preciona el boton

  //capturando los datos que son enviados desde el formulario(captura de todo el elemento)
  const title = taskForm["task-title"];
  const description = taskForm["task-description"];

  if (!editStatus) {
    //si el estado de editar es false
    await saveTask(title.value, description.value); //.value para pasar solamente el valor que contiene el campo
  } else {
    await updateTask(id, {
      //el id esta de forma global en el momento q se actualice el id deja de estar vacio y se llena con el id a editar
      title: title.value,
      description: description.value,
    });
    id = "";
    editStatus = false;
    taskForm["btn-task-form"].innerText = "Save";
  }

  taskForm.reset();
  title.focus();
}); //vamos a escuchar el evento del elemento seleccionado,cada vez que se envia algo vamos a capturarlo
