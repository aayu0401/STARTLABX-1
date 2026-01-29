import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/auth_service.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});
  @override ConsumerState<LoginScreen> createState()=>_LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final email=TextEditingController(); final pass=TextEditingController(); bool loading=false;
  @override Widget build(BuildContext context)=>Scaffold(
    appBar: AppBar(title: const Text('STARTLABX Login')),
    body: Padding(padding: const EdgeInsets.all(16), child: Column(children:[
      TextField(controller: email, decoration: const InputDecoration(prefixIcon: Icon(Icons.email), labelText:'Email')),
      TextField(controller: pass, decoration: const InputDecoration(prefixIcon: Icon(Icons.lock), labelText:'Password'), obscureText:true),
      const SizedBox(height:20),
      FilledButton(onPressed: loading?null:() async{
        setState(()=>loading=true);
        try{await ref.read(authProvider.notifier).login(email.text, pass.text);}catch(e){
          if(context.mounted){ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Login failed: $e')));}
        } finally{if(mounted)setState(()=>loading=false);}
      }, child: const Text('Login'))
    ])),
  );
}
