import 'package:flutter/material.dart';

class ReviewScreen extends StatefulWidget{
  const ReviewScreen({super.key});
  @override State<ReviewScreen> createState()=>_State();
}

class _State extends State<ReviewScreen>{
  double rating=4;
  final text=TextEditingController();
  @override Widget build(BuildContext context)=>Scaffold(
    appBar: AppBar(title: const Text('Leave a Review')),
    body: Padding(padding: const EdgeInsets.all(16),child: Column(children:[
      Slider(value: rating,min:1,max:5,divisions:4,label:rating.toString(),onChanged:(v)=>setState(()=>rating=v)),
      TextField(controller: text,decoration: const InputDecoration(labelText:'Feedback')),
      const SizedBox(height:12),
      FilledButton(onPressed:(){Navigator.pop(context);}, child: const Text('Submit'))
    ])),
  );
}
