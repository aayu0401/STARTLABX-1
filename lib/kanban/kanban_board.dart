import 'package:flutter/material.dart';

class KanbanBoard extends StatefulWidget{
  const KanbanBoard({super.key});
  @override State<KanbanBoard> createState()=>_State();
}

class _State extends State<KanbanBoard>{
  final todo=['Setup repo','Define schema'];
  final doing=['Develop API'];
  final done=['Design UI'];
  Widget col(String title,List<String> items)=>Expanded(child: Card(
    child: Padding(
      padding: const EdgeInsets.all(12),
      child: Column(children:[
        Text(title,style: const TextStyle(fontWeight: FontWeight.bold)),
        const Divider(),
        for(final t in items) Card(child: Padding(padding: const EdgeInsets.all(8),child: Text(t)))
      ]),
    ),
  ));
  @override
  Widget build(BuildContext context)=>Scaffold(
    appBar: AppBar(title: const Text('Project Board')),
    body: Row(children:[col('To do',todo),col('Doing',doing),col('Done',done)]),
  );
}
