import 'package:flutter/material.dart';

class SplashScreen extends StatelessWidget{
  const SplashScreen({super.key});
  @override
  Widget build(BuildContext context){
    Future.delayed(const Duration(seconds:2),(){
      Navigator.of(context).pushReplacementNamed('/onboarding');
    });
    return const Scaffold(body: Center(child: Text('STARTLABX',style: TextStyle(fontSize:28,fontWeight: FontWeight.bold))));
  }
}
