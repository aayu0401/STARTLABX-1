import 'package:flutter/material.dart';

class CopilotScreen extends StatefulWidget{
  const CopilotScreen({super.key});
  @override State<CopilotScreen> createState()=>_State();
}

class _State extends State<CopilotScreen>{
  final c=TextEditingController();
  final replies=<String>[];
  @override Widget build(BuildContext context)=>Scaffold(
    appBar: AppBar(title: const Text('AI Copilot')),
    body: Column(children:[
      Expanded(child: ListView(children:[
        for(final r in replies) ListTile(leading: const Icon(Icons.smart_toy),title: Text(r))
      ])),
      Row(children:[
        Expanded(child: TextField(controller: c,decoration: const InputDecoration(hintText:'Ask something...'))),
        IconButton(onPressed:(){
          setState(()=>replies.add('AI: (placeholder response for "${c.text}")'));
          c.clear();
        },icon: const Icon(Icons.send))
      ])
    ]),
  );
}
