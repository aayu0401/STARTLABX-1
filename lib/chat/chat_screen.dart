import 'package:flutter/material.dart';

class ChatBubble extends StatelessWidget{
  final String text;
  final bool me;
  const ChatBubble({super.key,required this.text,required this.me});
  @override
  Widget build(BuildContext context)=>Align(
    alignment: me?Alignment.centerRight:Alignment.centerLeft,
    child: Container(
      margin: const EdgeInsets.symmetric(vertical:6,horizontal:8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: me?Colors.green.shade200:Colors.white,
        borderRadius: BorderRadius.circular(14),
      ),
      child: Text(text),
    ),
  );
}

class ChatScreen extends StatefulWidget{
  const ChatScreen({super.key});
  @override State<ChatScreen> createState()=>_State();
}

class _State extends State<ChatScreen>{
  final controller=TextEditingController();
  final messages=<Map<String,dynamic>>[];
  @override
  Widget build(BuildContext context)=>Scaffold(
    appBar: AppBar(title: const Text('Chat')),
    body: Column(children:[
      Expanded(child: ListView(children:[
        for(final m in messages) ChatBubble(text:m['text'],me:m['me'])
      ])),
      Row(children:[
        Expanded(child: TextField(controller: controller,decoration: const InputDecoration(hintText:'Message'))),
        IconButton(onPressed:(){
          setState(()=>messages.add({'text':controller.text,'me':true}));
          controller.clear();
        },icon: const Icon(Icons.send))
      ])
    ]),
  );
}
