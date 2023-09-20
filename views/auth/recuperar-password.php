<h1 class="nombre-pagina">Reestablecer Password</h1>
<p class="descripcion-pagina">Coloca tu nuevo Password a continuación</p>

<?php include_once __DIR__ . '/../templates/alertas.php'; ?>

<!-- ESTE IF ES PARA QUE OCULTE EL FORMULARIO SI EL TOKEN NO ES VALIDO -->
<?php if($error) return; ?>

<form class="formulario" method="POST">

    <div class="campo">
        <label for="password">Password</label>
        <input type="password" name="password" id="password" placeholder="Tu Nuevo Password">
    </div>

    <input type="submit" value="Guardar Nuevo Password" class="boton">

</form>

<div class="acciones">
    <a href="/">¿Ya tienes una cuenta? Inicia Sesión</a>
    <a href="/crear-cuenta">¿Aún no tienes una cuenta? Crea una</a>
</div>