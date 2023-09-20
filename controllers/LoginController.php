<?php 

namespace Controllers;

use Classes\Email;
use Model\Usuario;
use MVC\Router;

class LoginController{


    public static function login(Router $router){

        $alertas = [];

        if($_SERVER['REQUEST_METHOD'] === 'POST'){

            $auth = new Usuario($_POST);

            $alertas = $auth->validarLogin();

            if( empty($alertas) ){
                //Comprobar que exista el Usuario
                $usuario = Usuario::where('email', $auth->email);

                if($usuario){

                    //Verificar el Password
                    if( $usuario->comprobarPasswordAndVerificado($auth->password) ){

                        session_start();
                        $_SESSION['id'] = $usuario->id;
                        $_SESSION['nombre'] = $usuario->nombre . " " . $usuario->apellido;
                        $_SESSION['email'] = $usuario->email;
                        $_SESSION['login'] = true;

                        //Redireccionar
                        if($usuario->admin === '1'){
                            $_SESSION['admin'] = $usuario->admin ?? null;
                            header('Location: /admin');
                        }else{
                            header('Location: /cita');
                        }

                    }
                
                }else{
                    Usuario::setAlerta('error', 'Usuario No Encontrado');
                }
            }

        }

        $alertas = Usuario::getAlertas();

        $router->render('auth/login', [
            'alertas' => $alertas
        ]);
    }

    public static function logout(){        
        session_start();
        $_SESSION = [];
        header('Location: /');
    }

    public static function olvide(Router $router){        

        $alertas = [];

        if($_SERVER['REQUEST_METHOD'] === 'POST'){

            $auth = new Usuario($_POST);
            $alertas = $auth->validarEmail();

            if(empty($alertas)){
                $usuario = Usuario::where('email', $auth->email);

                if($usuario && $usuario->confirmado === '1'){

                    //Generar un Token
                    $usuario->crearToken();

                    //Actualizamos el token
                    $usuario->guardar(); 

                    //Enviar el Email
                    $email = new Email($usuario->email, $usuario->nombre, $usuario->token);                    
                    $email->enviarInstrucciones();

                    //Alerta de envio
                    Usuario::setAlerta('exito', 'Revisa tu Email');

                }else{
                    Usuario::setAlerta('error', 'El Usuario no existe o no está confirmado');
                }

            }

        }

        $alertas = Usuario::getAlertas();

        $router->render('auth/olvide-password', [
            'alertas' => $alertas
        ]);

    }
 
    public static function recuperar(Router $router){    
        
        $alertas = [];
        $error = false;
        $token = s($_GET['token']);

        //Buscar usuario por su token
        $usuario = Usuario::where('token', $token);

        //Si no existe el token muestra el alert
        if(empty($usuario)){
            Usuario::setAlerta('error', 'Token No Válido');
            $error = true;
        }


        if($_SERVER['REQUEST_METHOD'] === 'POST'){

            $password = new Usuario($_POST);
            $alertas = $password->validarPassword();

            //Si no hay errores 
            if(empty($alertas)){
                $usuario->password = '';

                $usuario->password = $password->password;
                $usuario->hashPassword();
                $usuario->token = '';

                $resultado = $usuario->guardar();

                if($resultado){
                    header('Location: /');
                }
            }

        }

        //Muestra las alertas en pantalla
        $alertas = Usuario::getAlertas();
        
        $router->render('auth/recuperar-password', [
            'alertas' => $alertas,
            'error' => $error
        ]);

    }

    public static function crear(Router $router){

        $usuario = new Usuario;
        $alertas = [];

        if($_SERVER['REQUEST_METHOD'] === 'POST'){

            //Sincronizar con los datos de POST
            $usuario->sincronizar($_POST);

            //Validar los campos si están vacios
            $alertas = $usuario->validarNuevaCuenta();

            //Revisar que alertas esté vacia
            if(empty($alertas)){

                //Validar si el email está registrado
                $resultado = $usuario->existeUsuario();

                if($resultado->num_rows){
                    //Usuario ya se encuentra registrado
                    $alertas = Usuario::getAlertas();
                }else{

                    //Hashear el password
                    $usuario->hashPassword();

                    //Generar un Token
                    $usuario->crearToken();

                    //Enviar el email para verificacion
                    $email = new Email($usuario->email, $usuario->nombre, $usuario->token);
                    $email->enviarConfirmacion();

                    //Crear el Usuario
                    $resultado = $usuario->guardar();

                    if($resultado){
                        header('Location: /mensaje');
                    }
                    
                }

            }

        }

        
        $router->render('auth/crear-cuenta', [
            'usuario' => $usuario,
            'alertas' => $alertas
        ]);

    }

    public static function mensaje(Router $router){
        $router->render('auth/mensaje');
    }

    public static function confirmar(Router $router){

        $alertas = [];
        $token = s($_GET['token']);

        $usuario = Usuario::where('token', $token);

        if( empty($usuario) ){
            //Mostrar mensaje de error
            Usuario::setAlerta('error', 'Token No Válido');
        }else{
            //Modificar el campo confirmado en usuarios
            $usuario->confirmado = "1";
            $usuario->token = '';
            $usuario->guardar();

            Usuario::setAlerta('exito', 'Cuenta Comprobada Correctamente');
        }

        $alertas = Usuario::getAlertas();

        $router->render('auth/confirmar-cuenta', [ 
            'alertas' => $alertas
        ]);
    }

}