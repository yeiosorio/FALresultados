<?php
namespace App\Controller;
$listIp = ['https://191.101.12.40', 'http://localhost:4200'];

header('Access-Control-Allow-Origin: *');
// $http_origin = $_SERVER['HTTP_ORIGIN'];

// if ($http_origin == "http://www.domain1.com" || $http_origin == "http://www.domain2.com" || $http_origin == "http://www.domain3.com")
// {  
//     header("Access-Control-Allow-Origin: $http_origin");
// }

// header('Access-Control-Allow-Headers : *');

use App\Controller\AppController;

use Cake\Event\Event;
use Cake\Network\Exception\UnauthorizedException;
use Cake\Utility\Security;
use Firebase\JWT\JWT;
use Cake\Datasource\ConnectionManager;
use Cake\Auth\DefaultPasswordHasher;

use Cake\Network\Email\Email;

/**
 * 
 * WsUsers Controller
 *
 * @property \App\Model\Table\UsersTable $Users
 */
class WsUsersController extends AppController
{   

    public function initialize()
    {
        parent::initialize();
        $this->Auth->allow(['token', 'register', 'getEmailRegister', 'userAuthenticate', 'recoveryPassword', 'changePassword', 'getOrdersByRol', 'getInfoResult', 'addPrintControl', 'getClients']);

        $this->loadComponent('ResourceManager');
    }

    public function add(){
        $this->Crud->on('afterSave', function(Event $event) {
            if ($event->subject->created) {
                $this->set('data', [
                    'id' => $event->subject->entity->id,
                    'token' => JWT::encode(
                        [
                        'sub' => $event->subject->entity->id,
                        'exp' =>  time() + 18000
                        ],
                        Security::salt())
                    ]);

                $this->Crud->action()->config('serialize.data', 'data');
            }
        });
        return $this->Crud->execute();
    }

    /**
     * @author Yeison Osorio
     * @source 2019/03/22
     * @desc Se consulta que el paciente tenga registrado un emai len Fundacion para el  posterior registro
     */
    public function getEmailRegister(){
        $data = $this->request->input('json_decode');
        $identification = $data->identification;
       
        $this->loadModel('People');
        $people = $this->People->find('all',['conditions'=>['People.identification'=> $identification]])->toArray();
      
        if ($people) {
            $people = $people[0];

            // Si tiene email se procede a registrar
          
            if ($people['email'] != "" && $people['email'] != "NO TIENE") {
                $this->register($people);
            }else{//No posee email registrado en fundacion
              
                print json_encode(['noExist' => false, 'success'=> false, 'msg' => '¡No cuentas con un correo electrónico, para esto debes dirigirte a la Fundación Alejandro Londoño!.']);
                exit();
            }
        
        }else{
            print json_encode(['noExist'=> true, 'msg' => '¡Lo sentimos!. La identificación no se registra en el sistema, por favor acércate a la Fundación Alejandro Londoño para registrar tu email. ']);
            exit();
        }

    }

    /**
     * @author Yeison Osorio
     * @source 2019/03/22
     * @desc Registro en tabla de usuarios para la aplicacion
     */
    public function register($people = null){
        
        $this->loadModel('People');
        $this->loadModel('UsersApp');

        if ($people == null) {
            $data = $this->request->input('json_decode');
            $identification = $data->identification;
            $email = $data->email;

            $people = $this->People->find('all', ['conditions'=>['People.identification'=> $identification]])->toArray();
    
            $strPass = "resultadosFAL2019";
            $pass = md5($strPass);
            
            $data = [
                'people_id' => $people[0]['id'],
                'email' => $email,
                'identification' => $identification,
                'password' => $pass,
                'rol' => 3,
                'state' => 1,
                'created' => date('Y-m-d H:i:s'),
                'modified' => date('Y-m-d H:i:s'),
            ];

        }else{

            $strPass = "resultadosFAL2019";
            $pass = md5($strPass);
            $email = $people['email'];
            $identification = $people['identification'];

            $data = [
                'people_id' => $people['id'],
                'email' => $people['email'],
                'identification' => $people['identification'],
                'password' => $pass,
                'rol' => 3,
                'state' => 1,
                'created' => date('Y-m-d H:i:s'),
                'modified' => date('Y-m-d H:i:s'),
            ];

        }
        
        $user = $this->UsersApp->find('all', ['conditions'=>['UsersApp.identification'=> $identification]])->toArray();

        if(!$user){
            $usersApp = $this->UsersApp->newEntity();
            $saveUsersApp = $this->UsersApp->patchEntity($usersApp, $data);

            $username = $people[0]['first_name'] ." ". $people[0]['middle_name'] ." ". $people[0]['last_name'];
            // Envio de email con contraseña
            $sendEmail = $this->sendEmailRegister($email, $username, $identification);
            $success = false;

            if ($sendEmail) {
                if ($this->UsersApp->save($saveUsersApp)) {
                    $success = true;
                    $msg = "¡Felicitaciones su registro ha sido exitoso!. Le ha sido enviado un email a '$email' con su contraseña, en caso de no reconocer el email acérquese a la Fundación Alejandro Londoño";
                } else {
                    $success = false;
                    $msg = "Lo sentimos ha ocurrio un error!. vuelva a intentar";
                    $errors = $saveAppoDates->errors();
                }
            }else{//No envia email
                $success = false;
                $msg = "Lo sentimos ha ocurrio un error enviando la contraseña al email: ". $email;
                $errors = $saveAppoDates->errors();
            }

        }else{
            $success = false;
            $msg = "¡El usuario que intenta registrar ya existe!.";
        }

        print json_encode(['msg'=>$msg, 'success'=>$success]);
        exit();
    }

    public function userAuthenticate(){
        $data = $this->request->input('json_decode');
        $identification = $data->identification;
        $password = $data->password;

        $password = md5($password);

        $this->loadModel('UsersApp');
        $user = $this->UsersApp->find('all', ['conditions'=>['UsersApp.identification'=> $identification, 'UsersApp.password'=> $password]])->toArray();
       
        // Si el usuario esta activo generamos el token
        if ($user) {
            if ($user[0]['state'] == 1) {
                $this->token($user[0]);
            }else{
                $msg = "Lo sentimos el usuario se encuentra inactivo, por favor comuníquese con la Fundación Alejandro Londoño";
                print json_encode(['msg'=> $msg, 'success'=> false]);
                exit();
            }
        }else{
            $msg = "¡Datos incorrectos!, verifique y vuelva a intentarlo";
            print json_encode(['msg'=> $msg, 'success'=> false]);
            exit();
        }

    }

    public function recoveryPassword(){
        $this->autoRender = false;
        $data = $this->request->input('json_decode');
        $identification = $data->identification;

        $this->loadModel('UsersApp');
        $user = $this->UsersApp->find('all', ['conditions'=>['UsersApp.identification'=> $identification]])->toArray();

        // Si existe el usuario y esta activo enviamos email con nuevo password
        if ($user) {
            if ($user[0]['state'] == 1) {
                $email = $user[0]['email'];
                // Luego de enviar el email procedemos a modificar la contraseña en la tabla de [users_app]
                if ($this->sendEmailRecovery($email, $identification)) {
                    $passEncrypt = md5('resultadosFAL2019');

                    $data = ['password' => $passEncrypt, 'change_password' => 0];
                    $userEdit = $this->UsersApp->get($user[0]['id']);
                    $userEdited = $this->UsersApp->patchEntity($userEdit, $data);

                    if ($this->UsersApp->save($userEdited)) {
                        $success = true;
                        $msg = "Le fue enviado un correo electrónico a $email, por favor verifique su bandeja de entrada o correo no deseado";
                        
                    } else {
                        $success = false;
                        $msg = "Lo sentimos ocurrio un error";
                        $errors = $saveAppoDates->errors();
                    }

                }else{
                    $msg = "Lo sentimos ocurrio un error enviando la contraseña al email: ". $email;
                    $success = false;
                }

            }else{
                $msg = "Lo sentimos el usuario se encuentra inactivo, por favor comuníquese con la Fundación Alejandro Londoño";
                $success = false;
            }
        }else{
            $msg = "Lo sentimos el usuario no se encuentra registrado";
            $success = false;
        }

        print json_encode(['msg'=> $msg, 'success'=> $success]);
        exit();

    }

    // Cambio de password
    public function changePassword(){
        $this->autoRender = false;
        $data = $this->request->input('json_decode');
        $antPassword = $data->antPassword;
        $newPassword = $data->newPassword;
        $identification = $data->identification;

        $antPassword = md5($antPassword);

        $this->loadModel('UsersApp');
        $user = $this->UsersApp->find('all', ['conditions'=>['UsersApp.password'=> $antPassword, 'UsersApp.identification'=> $identification ]])->toArray();

        // Si existe el usuario y esta activo enviamos email con nuevo password
        if ($user) {
            if ($user[0]['state'] == 1) {
                $passEncrypt = md5($newPassword);

                $data = [
                    'password' => $passEncrypt,
                    'change_password' => 1
                ];
                $userEdit = $this->UsersApp->get($user[0]['id']);
                $userEdited = $this->UsersApp->patchEntity($userEdit, $data);

                if ($this->UsersApp->save($userEdited)) {
                    $success = true;
                    $msg = "¡La contraseña ha sido actualizada con éxito!";
                } else {
                    $success = false;
                    $msg = "Lo sentimos ocurrio un error";
                    $errors = $saveAppoDates->errors();
                }

            }else{
                $msg = "¡Lo sentimos el usuario se encuentra inactivo, por favor comuníquese con la Fundación Alejandro Londoño!";
                $success = false;
            }
        }else{
            $msg = "¡Lo sentimos la contraseña actual $data->antPassword es incorrecta!";
            $success = false;
        }

        print json_encode(['msg'=> $msg, 'success'=> $success]);
        exit();

    }
    // Cambio de password
    public function getOrdersByRol(){
        $this->autoRender = false;
        $data = $this->request->input('json_decode');
        $rol = $data->rol;
        $identification = $data->identification;
        $dateIni = $data->dateIni;
        $dateEnd = $data->dateEnd;
        $client = $data->client ? $data->client: "";
        $filterClient = "";

        $conn = ConnectionManager::get('default');

        if ($rol == "1") {//[ENTIDAD]
            // consulta para rol entidad:
            $query = $conn->execute("SELECT Results.id result_id, Results.created result_fecha, Results.content result_content, Results.specialists_id, Results.state Results_state, 
            Attentions.id attentions_id, Attentions.date_time_ini, Attentions.date_time_end, Orders.order_consec, Orders.id order_id, 
            CONCAT(People.first_name, ' ', People.middle_name, ' ', People.last_name, ' ', People.last_name_two) people_name, People.identification, People.id people_id, 
            Studies.id studies_id, Studies.cup, Studies.name, Clients.id client_id, Clients.name client, specialis_detail.specialist_name, specialis_detail.specialist_ident, 
            specialis_detail.professionar_card, Results.state estado, -- 0 pendiente, 1 autorizada 
            Clients.state_app state_download
            FROM results Results
            INNER JOIN attentions Attentions ON (Results.attentions_id = Attentions.id )
            INNER JOIN appointments Appointments ON Appointments.id = (Attentions.appointments_id)
            INNER JOIN order_appointments OrderAppointments ON OrderAppointments.appointments_id = Appointments.id
            INNER JOIN orders Orders ON (Orders.id = OrderAppointments.orders_id )
            INNER JOIN patients Patients ON Patients.id = (Orders.patients_id)
            INNER JOIN people People ON People.id = (Patients.people_id)
            INNER JOIN document_types DocumentTypes ON DocumentTypes.id = (People.document_types_id)
            INNER JOIN clients Clients ON Clients.id = (Orders.clients_id)
            INNER JOIN studies Studies ON Studies.id = (Appointments.studies_id) LEFT JOIN birads Birads ON Results.id = (Birads.results_id)
            INNER JOIN
            (SELECT
            specialists.id,
            CONCAT(People.first_name, ' ', People.middle_name, ' ', People.last_name, ' ', People.last_name_two) specialist_name,
            People.identification specialist_ident,
            specialists.professionar_card
            FROM
            specialists
            INNER JOIN people People ON (People.id = specialists.people_id)) specialis_detail ON (specialis_detail.id = Results.specialists_id)
            WHERE (Results.id = (SELECT MAX(rs.id) FROM results rs WHERE rs.attentions_id = Attentions.id) )
            and Clients.id = $identification
            AND date(Attentions.created) >= '$dateIni'
            AND date(Attentions.created) <= '$dateIni'
            ORDER BY Results.created DESC")->fetchAll('assoc');
        }

        if ($rol == "2") {//[MEDICO]
            // consulta para rol medico:
            $query = $conn->execute("SELECT Results.id result_id, Results.created result_fecha, Results.content result_content, Results.specialists_id, Results.state Results_state, 
            Attentions.id attentions_id, Attentions.date_time_ini, Attentions.date_time_end, Orders.order_consec, Orders.id order_id, 
            CONCAT(People.first_name, ' ', People.middle_name, ' ', People.last_name, ' ', People.last_name_two) people_name, People.identification, People.id people_id, People.gender,
            Studies.id studies_id, Studies.cup, Studies.name, Clients.id client_id, Clients.name client, specialis_detail.specialist_name, specialis_detail.specialist_ident, 
            specialis_detail.professionar_card, Results.state estado, -- 0 pendiente, 1 autorizada 
            1 state_download
            FROM results Results
            INNER JOIN attentions Attentions ON (Results.attentions_id = Attentions.id )
            INNER JOIN appointments Appointments ON Appointments.id = (Attentions.appointments_id)
            INNER JOIN order_appointments OrderAppointments ON OrderAppointments.appointments_id = Appointments.id
            INNER JOIN orders Orders ON (Orders.id = OrderAppointments.orders_id )
            INNER JOIN patients Patients ON Patients.id = (Orders.patients_id)
            INNER JOIN people People ON People.id = (Patients.people_id)
            INNER JOIN document_types DocumentTypes ON DocumentTypes.id = (People.document_types_id)
            INNER JOIN clients Clients ON Clients.id = (Orders.clients_id)
            INNER JOIN studies Studies ON Studies.id = (Appointments.studies_id) LEFT JOIN birads Birads ON Results.id = (Birads.results_id)
            INNER JOIN
            (SELECT specialists.id, CONCAT(People.first_name, ' ', People.middle_name, ' ', People.last_name, ' ', People.last_name_two) specialist_name,
            People.identification specialist_ident,
            specialists.professionar_card
            FROM specialists
            INNER JOIN people People ON (People.id = specialists.people_id)) specialis_detail ON (specialis_detail.id = Results.specialists_id)
            WHERE ( Results.id = (SELECT MAX(rs.id) FROM results rs WHERE rs.attentions_id = Attentions.id) )
            AND Results.specialists_id = $identification
            AND date(Attentions.date_time_ini) >= '$dateIni'
            AND date(Attentions.date_time_end) <= '$dateIni'
            ORDER BY Results.created DESC")->fetchAll('assoc');
        }


        if ($rol == "3") {//[PACIENTE]

            // consulta para rol paciente:
            $query = $conn->execute("SELECT 
            Results.id result_id,
            Results.created result_fecha,
            Results.content result_content,
            Results.specialists_id,
            Results.state Results_state,
            Attentions.id attentions_id,
            Attentions.date_time_ini,
            Attentions.date_time_end,
            Orders.order_consec,
            Orders.id order_id,
            Orders.created order_fecha,
            CONCAT(People.first_name,
                    ' ',
                    People.middle_name,
                    ' ',
                    People.last_name,
                    ' ',
                    People.last_name_two) people_name,
            People.identification,
            People.id people_id,
            Studies.id studies_id,
            Studies.cup,
            Studies.name,
            Clients.id client_id,
            Clients.name client,
            specialis_detail.specialist_name,
            specialis_detail.specialist_ident,
            specialis_detail.professionar_card,
            Results.state estado, -- 0 pendiente, 1 autorizada
            1 state_download
           -- if (orders_bills.bills_id is null, 0, 1)  state_download
        FROM
            results Results
                INNER JOIN
            attentions Attentions ON (Results.attentions_id = Attentions.id)
                INNER JOIN
            appointments Appointments ON Appointments.id = (Attentions.appointments_id)
                INNER JOIN
            order_appointments OrderAppointments ON OrderAppointments.appointments_id = Appointments.id
                INNER JOIN
            orders Orders ON (Orders.id = OrderAppointments.orders_id
               )
             /*   left JOIN
            orders_bills ON (Orders.id = orders_bills.orders_id)
                left JOIN
            bills ON (orders_bills.bills_id = bills.id)
                left JOIN
            payments ON (payments.bills_id = bills.id)
            */
                INNER JOIN
            patients Patients ON Patients.id = (Orders.patients_id)
                INNER JOIN
            people People ON People.id = (Patients.people_id)
                INNER JOIN
            clients Clients ON Clients.id = (Orders.clients_id)
                INNER JOIN
            studies Studies ON Studies.id = (Appointments.studies_id)
                LEFT JOIN
            birads Birads ON Results.id = (Birads.results_id)
                INNER JOIN
            (SELECT 
                specialists.id,
                    CONCAT(People.first_name, ' ', People.middle_name, ' ', People.last_name, ' ', People.last_name_two) specialist_name,
                    People.identification specialist_ident,
                    specialists.professionar_card
            FROM
                specialists
            INNER JOIN people People ON (People.id = specialists.people_id)) specialis_detail ON (specialis_detail.id = Results.specialists_id)
        WHERE
            (
               Results.id = (SELECT 
                    MAX(rs.id)
                FROM
                    results rs
                WHERE
                    rs.attentions_id = Attentions.id))
                AND People.identification= $identification
                -- se comenta para que salgan todos los resultados del paciente, peticion de FAL
          --  AND date(Attentions.created) >= '$dateIni'
          --  AND date(Attentions.created) <= '$dateEnd'
            -- AND date(Orders.created) >= '2018-01-02'
            -- AND date(Orders.created) <= '2018-01-02'
            ORDER BY Results.created DESC
            ")->fetchAll('assoc');

        }

        if ($rol == "0") {//[ADMIN]
            
            if(!empty($client)){
                $filterClient =" AND Clients.id = $client";
            }
            // consulta para rol ADMIN:
            $query = $conn->execute("SELECT Results.id result_id, Results.created result_fecha, Results.content result_content, Results.specialists_id, Results.state Results_state, 
            Attentions.id attentions_id, Attentions.date_time_ini, Attentions.date_time_end, Orders.order_consec, Orders.id order_id, Orders.created order_fecha, 
            CONCAT(People.first_name, ' ', People.middle_name, ' ', People.last_name, ' ', People.last_name_two) people_name, People.identification, People.id people_id, People.gender, 
            Studies.id studies_id, Studies.cup, Studies.name, Clients.id client_id, Clients.name client, specialis_detail.specialist_name, specialis_detail.specialist_ident, 
            specialis_detail.professionar_card, Results.state estado, -- 0 pendiente, 1 autorizada 
            1 state_download
            FROM
            results Results
            INNER JOIN attentions Attentions ON (Results.attentions_id = Attentions.id)
            INNER JOIN appointments Appointments ON Appointments.id = (Attentions.appointments_id)
            INNER JOIN order_appointments OrderAppointments ON OrderAppointments.appointments_id = Appointments.id
            INNER JOIN orders Orders ON (Orders.id = OrderAppointments.orders_id
            AND Orders.centers_id = 1)
               /* INNER JOIN orders_bills ON (Orders.id = orders_bills.orders_id)
            INNER JOIN bills ON (orders_bills.bills_id = bills.id)
            INNER JOIN payments ON (payments.bills_id = bills.id)
            */
            INNER JOIN patients Patients ON Patients.id = (Orders.patients_id)
            INNER JOIN people People ON People.id = (Patients.people_id)
            INNER JOIN clients Clients ON Clients.id = (Orders.clients_id)
            INNER JOIN studies Studies ON Studies.id = (Appointments.studies_id)
            LEFT JOIN birads Birads ON Results.id = (Birads.results_id) INNER JOIN
            (SELECT
            specialists.id,
            CONCAT(People.first_name, ' ', People.middle_name, ' ', People.last_name, ' ', People.last_name_two) specialist_name,
            People.identification specialist_ident,
            specialists.professionar_card
            FROM
            specialists
            INNER JOIN people People ON (People.id = specialists.people_id)) specialis_detail ON (specialis_detail.id = Results.specialists_id)
            WHERE (Results.id = (SELECT MAX(rs.id)
            FROM results rs
            WHERE rs.attentions_id = Attentions.id))
            AND date(Attentions.created) >= '$dateIni'
            AND date(Attentions.created) <= '$dateEnd'
            $filterClient
            ORDER BY Results.created DESC
            ")->fetchAll('assoc');

        }

        if (!$query) {
            $msg = "¡No se encontraron datos!";
            $success = false;
        }else{
            $success = true;
            $msg = "";
            
        }

        print json_encode(['msg'=> $msg, 'success'=> $success, 'listOrders' => $query]);
        exit();

    }

    public function token($user){

        $conn = ConnectionManager::get('default');
        $this->loadModel('People');

        // Para el rol cliente obtenemos informacion de la tabla [client]
        if ($user['rol'] == "1") {

            $client_id = $user['usuario_id'];

            $person = $conn->execute("SELECT c.name
                FROM clients c
                WHERE c.id = $client_id")->fetchAll('assoc');
          
        // Para el rol de medico obtenemos informacion de la tabla [specialists]
        }else if($user['rol'] == "2"){

            $specialist_id = $user['usuario_id'];

            $person = $conn->execute("SELECT CONCAT(p.first_name, ' ', p.middle_name, ' ', p.last_name) name
                FROM specialists s
                JOIN people p ON s.people_id = p.id
                WHERE s.id = $specialist_id")->fetchAll('assoc');

        // Para el rol de paciente obtenemos informacion de la tabla [people]
        }else{
            $people_id = $user['people_id'];

            $person = $conn->execute("SELECT CONCAT(p.first_name, ' ', p.middle_name, ' ', p.last_name) name
                FROM people p
                WHERE p.id = $people_id")->fetchAll('assoc');

        }

       $person = $person[0];
        $this->set([
            'user' => $user,
            'person' => $person,
            'success' => true,
            'data' => [
                'token' => JWT::encode([
                        'sub' => $user['id'],
                        'user'=> $user,//['id'=>$user['id'], 'roles_id'=>$user['roles_id']],
                        'person' => $person, //['first_name'=>$person['first_name'], 'middle_name'=>$person['middle_name'], 'last_name'=>$person['last_name'], 'last_name_two'=>$person['last_name_two']],
                        'exp' =>  time() + 604800
                    ],
                    Security::salt())
            ],
            '_serialize' => ['success', 'data', 'user', 'person']
        ]);
          
    }

    public function getInfoResult(){

        $this->loadModel('Specialists');

        $data = $this->request->input('json_decode');
        $peopleId = $data->people_id;
        $id = $data->id;

        // Se obtiene foto de paciente
        $picture = $this->ResourceManager->getResources($peopleId, 'people', 'profile_pic');
        $picture = $picture ? $picture[0] : "" ;

        //Informacion de especialista
        $specialists = $this->Specialists->find('all', [
            'contain' => ['People'],
            'conditions'=>['Specialists.id'=>$id]])->first();
        $specialists = $specialists ? $specialists : "";

        //Se obtiene firma de especialista
        $signature = $this->ResourceManager->getResources($id, 'specialist', 'specialist_signature');
        $signature = $signature ? $signature[0] : "" ;

        print json_encode(['picture'=> $picture, 'specialists'=> $specialists, 'signature' => $signature]);
        exit();

        
    }

    public function addPrintControl(){
        $data = $this->request->input('json_decode');
        $this->loadModel('PrintControls');

        $printControl = $this->PrintControls->newEntity();

        $dataLog = [
            'results_id'=> $data->results_id,
            'users_id'=> $data->users_id
        ];

        $printControl = $this->PrintControls->patchEntity($printControl, $dataLog);
      
        if ($this->PrintControls->save($printControl)) {
            $success = true;
        } else {
            $success = false;
        }

        print json_encode(['success'=> $success]);
        exit();
    }

    public function sendEmailRegister($email, $username, $identification){
        /*Para este ejemplo no necesito de renderizar
          una vista por lo que autorender lo pongo a false
         */
        $this->autoRender = false;
        
        /*configuramos las opciones para conectarnos al servidor
          smtp de Gmail
         */
        Email::configTransport('mail', [
          'host' => 'ssl://smtp.gmail.com', //servidor smtp con encriptacion ssl
          'port' => 465, //puerto de conexion
          //'tls' => true, //true en caso de usar encriptacion tls
          
          //cuenta de correo gmail completa desde donde enviaran el correo
          'username' => 'falejandrolondono@gmail.com', 
          'password' => 'gatoloco2019', //contrasena
          
          //Establecemos que vamos a utilizar el envio de correo por smtp
          'className' => 'Smtp', 
          
          //evitar verificacion de certificado ssl ---IMPORTANTE---
          /*'context' => [
            'ssl' => [
              'verify_peer' => false,
              'verify_peer_name' => false,
              'allow_self_signed' => true
            ]
          ]*/
        ]); 
        /*fin configuracion de smtp*/
        
        /*enviando el correo*/
        $correo = new Email(); //instancia de correo
        $correo
          ->transport('mail') //nombre del configTrasnport que acabamos de configurar
          ->template('default') //plantilla a utilizar
          ->emailFormat('html') //formato de correo
          ->to($email) //correo para
          ->from('falejandrolondono@gmail.com') //correo de
          ->subject('Registro exitoso en la aplicación de resultados de la Fundación Alejandro Londoño') //asunto
          ->viewVars([ //enviar variables a la plantilla
            'email' => $email,
            'username' => $username,
            'identification' => $identification
          ]);
        
        if($correo->send()){
            return true;
        }else{
          return false;
          
        }    
      }

    //   Envio email recuperacion de password
    public function sendEmailRecovery($email, $identification){
        /*Para este ejemplo no necesito de renderizar
          una vista por lo que autorender lo pongo a false
         */
        $this->autoRender = false;
        
        /*configuramos las opciones para conectarnos al servidor
          smtp de Gmail
         */
        Email::configTransport('mail', [
          'host' => 'ssl://smtp.gmail.com', //servidor smtp con encriptacion ssl
          'port' => 465, //puerto de conexion
          //'tls' => true, //true en caso de usar encriptacion tls
          
          //cuenta de correo gmail completa desde donde enviaran el correo
          'username' => 'falejandrolondono@gmail.com',
          'password' => 'gatoloco2019', //contrasena
          
          //Establecemos que vamos a utilizar el envio de correo por smtp
          'className' => 'Smtp', 
          
          //evitar verificacion de certificado ssl ---IMPORTANTE---
          /*'context' => [
            'ssl' => [
              'verify_peer' => false,
              'verify_peer_name' => false,
              'allow_self_signed' => true
            ]
          ]*/
        ]); 
        /*fin configuracion de smtp*/
        
        
        /*enviando el correo*/
        $correo = new Email(); //instancia de correo
        $correo
          ->transport('mail') //nombre del configTrasnport que acabamos de configurar
          ->template('recoveryPassword') //plantilla a utilizar
          ->emailFormat('html') //formato de correo
          ->to($email) //correo para
          ->from('falejandrolondono@gmail.com') //correo de
          ->subject('Registro exitoso en la aplicación de resultados de la Fundación Alejandro Londoño') //asunto
          ->viewVars([ //enviar variables a la plantilla
            'email' => $email,
            'identification' => $identification
          ]);
        
        if($correo->send()){
            return true;
        }else{
          return false;
          
        }    
      }

// consulta el listado de clientes activos state = 1  de la fundacion alejandro londoño
      public function getClients (){
        $this->autoRender = false;
        $conn = ConnectionManager::get('default');
        $query = $conn->execute("SELECT  id, name, nit, social_reazon,email from clients where state = 1 ")->fetchAll('assoc');
    
        if (!$query) {
            $msg = "¡No se encontraron Clientes!";
            $success = false;
        }else{
            $success = true;
            $msg = "";
            
        }

        print json_encode(['msg'=> $msg, 'success'=> $success, 'listClients' => $query]);
        exit();

      }

}




