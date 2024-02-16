$(function () {
    $(".btn-evento").on("click", function () {
        let form = $("#" + $(this).data("formulario"));
        if (form[0].checkValidity() === false) {
            event.preventDefault();
            event.stopPropagation();
        } else {
            if ($('#idioma').val().length == 0) {
                Swal.fire("Por favor llenar todos los campos por favor!");
                return false;
            }else{
                $.ajax({
                    type: "POST",
                    url: servidor + "idioma/registro",
                    dataType: "json",
                    data: new FormData(form.get(0)),
                    contentType: false,
                    cache: false,
                    processData: false,
                    beforeSend: function () {
                        // setting a timeout
                        $("#loading").addClass("loading");
                    },
                    success: function (data) {
                        console.log(data);
                        Swal.fire({
                            position: "top-end",
                            icon: data.estatus,
                            title: data.titulo,
                            text: data.respuesta,
                            showConfirmButton: false,
                            timer: 2000,
                        });
                        setTimeout(() => {
                            location.reload();
                        }, 2000);
                    },
                    error: function (data) {
                        console.log("Error ajax");
                        console.log(data);
                        console.log(data.log);
                    },
                    complete: function () {
                        $("#loading").removeClass("loading");
                    },
                });
            }
        }
        form.addClass("was-validated");
    });
    $("#documento").on("change", (e) => {
        const archivo = $(e.target)[0].files[0];
    
        if (archivo) {
            const nombArchivo = archivo.name;
            const extension = nombArchivo.split(".").slice(-1)[0].toLowerCase();
            const extensionesPermitidas = [".pdf"];
    
            if (extensionesPermitidas.indexOf("." + extension) === -1) {
                Swal.fire({
                    icon: 'error',
                    title: 'Extensión NO permitida',
                    text: 'Por favor, selecciona un archivo PDF.',
                });
                $("#documento").val("");
            } else {}
        }
    });
    
    async function cardsEventos() {
        try {
            let peticion = await fetch(servidor + `idioma/MostrarIdioma`);
            let response = await peticion.json();
            if (response.length == 0) {
                jQuery(`<h3 class="mt-4 text-center text-uppercase">Sin idiomas asignados</h3>`).appendTo("#container-eventos").addClass('text-danger');
                return false;
            }
            $("#container-eventos").empty();
            jQuery(`<table class="table align-items-center mb-0 table table-striped table-bordered" style="width:100%" id="info-table-result">
                <thead><tr>
                <th class="text-uppercase">IDIOMA</th>
                <th class="text-uppercase">ESTATUS</th>
                <th class="text-uppercase">ACCIONES</th>
                </tr></thead>
                </table>
                `)
                .appendTo("#container-eventos")
                .removeClass("text-danger");
            $('#info-table-result').DataTable({
                "drawCallback": function (settings) {
                    $('.paginate_button').addClass("btn").removeClass("paginate_button");
                    $('.dataTables_length').addClass('pull-left');
                    $('#info-table-result_filter').addClass('pull-right');
                    $('input').addClass("form-control");
                    $('select').addClass('form-control');
                    $('.previous.disabled').addClass("btn-outline-info opacity-5 btn-rounded mx-2 mt-3");
                    $('.next.disabled').addClass("btn-outline-info opacity-5 btn-rounded mx-2 mt-3");
                    $('.previous').addClass("btn-outline-info btn-rounded mx-2 mt-3");
                    $('.next').addClass("btn-outline-info btn-rounded mx-2 mt-3");
                },
                "language": {
                    "url": "https://cdn.datatables.net/plug-ins/9dcbecd42ad/i18n/Spanish.json"
                },
                "pageLength": 4,
                "lengthMenu": [[4, 8, 12], [4, 8, "All"]],
                data: response,
                "columns": [
                    { "data": "Idioma", className: 'text-vertical text-center' },
                    { "data": "Estatus", className: 'text-vertical text-center' },
                    {
                        data: null,
                        render: function (data) {
                        botones = `<div class="col-sm-12 col-md-12 col-lg-12 col-<xl-12 d-flex justify-content-between align-items-center" >
                            <button data-id="${btoa(btoa(data.id_idioma))}" data-bs-toggle="tooltip" title="Eliminar idioma" type="button" class="btn btn-danger btn-eliminar-idioma"><i class="fa-solid fa-trash-can"></i></button>
                            </div>`;
                            return botones;
                        },
                        className: 'text-vertical text-center'
                    }
                    ],
                    createRow: function(row, data, dataIndex){
                        $(row).addClass('tr-usuario')
                    }
                });
            } catch (error) {
            if (error.name == 'AbortError') { } else { throw error; }
        }
    }
    cardsEventos();
    $('#container-eventos').on('click', '.btn-edit-event', function () {
        $('#modalEventosLabel').text('Editar evento');
        $("#form-new-event")[0].reset();
        $('#tipo').val('editar');
        editarEvento($(this).data('id'));
    });
});
$(document).on('click', '.btn-eliminar-idioma', function() {
    var id_idioma = $(this).data('id');
    eliminarIdioma(id_idioma);
});    
function eliminarIdioma(id_idioma) {
    const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger"
    },
        buttonsStyling: false
    });    
    swalWithBootstrapButtons.fire({
        title: "¿Estás seguro?",
        text: "No podrás revertir esto",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, eliminarlo",
        cancelButtonText: "No, cancelar",
        reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    type: "POST",
                    url: servidor + `idioma/eliminarIdioma/${id_idioma}`,
                    dataType: "json",
                    beforeSend: function () {
                        $("#loading").addClass("loading");
                    },
                    success: function (data) {
                        console.log(data);
                        swalWithBootstrapButtons.fire({
                            title: data.titulo,
                            text: data.respuesta,
                            icon: data.estatus
                        });    
                        setTimeout(() => {
                            location.reload();
                        }, 2000);
                    },
                    error: function (xhr, status, error) {
                        console.log("Error ajax");
                        console.log(xhr);
                        console.log(status);
                        console.log(error);
                    },
                    complete: function () {
                        $("#loading").removeClass("loading");
                    },
                });
            } else if (result.dismiss === Swal.DismissReason.cancel) {
            swalWithBootstrapButtons.fire({
                title: "Cancelado",
                text: "Tu archivo imaginario está a salvo :)",
                icon: "error"
            });
        }
    });
}
$('body').on('dblclick', '#info-table-result tbody tr', function () {
    var data = $('#info-table-result').DataTable().row(this).data();
    if (data['id_idioma'] == 0) {
        registroNoEditar();
    } else {
        $("#form-idioma")[0].reset();
        $('#modalEventosLabel').text('Editar idioma');
        $('#modalEventos').modal('show');
        buscarIdioma(data['id_idioma']);
    }
});
async function buscarIdioma(id_idioma) {
    try {
        let peticion = await fetch(servidor + `idioma/buscarIdioma/${id_idioma}`);
        let response = await peticion.json();
        $('#id_idioma').val(response['id_idioma']);
        $('#idioma').val(response['Idioma']);
        $('#estatus').val(response['Estatus']);
    } catch (error) {
        if (error.name == 'AbortError') { } else { throw error; }
    }
}
$(document).on('click', '.btn-actualizar-usuario', function() {
    var id_usuario = $(this).data('id');
    var formData = new FormData($('#form-usuario')[0]);
    formData.append('id_usuario', id_usuario);

    console.log(formData);
    actualizarUsuario(formData);
});

function actualizarUsuario(formData) {
    if ($('#ac_nombre').val().length == 0 || $('#ac_apellido_paterno').val().length == 0 || $('#ac_genero').val().length == 0 || $('#ac_correo').val().length == 0 || $('#ac_password').val().length == 0 || $('#ac_tipo_usuario').val().length == 0 || $('#ac_estatus').val().length == 0) {
        Swal.fire("Por favor llenar todos los campos por favor!");
        return false;
    }else{
        $.ajax({
            type: "POST",
            url: servidor + 'usuario/actualizarUsuario',
            data: formData,
            dataType: "json",
            contentType: false,
            processData: false,
            beforeSend: function () {
                $("#loading").addClass("loading");
            },
            success: function (data) {
                console.log(data);
                Swal.fire({
                    position: "top-end",
                    icon: data.estatus,
                    title: data.titulo,
                    text: data.respuesta,
                    showConfirmButton: false,
                    timer: 2000,
                });
                setTimeout(() => {
                    location.reload();
                }, 2000);
            },
            error: function (xhr, status, error) {
                console.log("Error ajax");
                console.log(xhr);
                console.log(status);
                console.log(error);
            },
            complete: function () {
                $("#loading").removeClass("loading");
            },
        });
    }
}