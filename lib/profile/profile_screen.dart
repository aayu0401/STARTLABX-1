import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/auth_service.dart';

class ProfileScreen extends ConsumerStatefulWidget {
  const ProfileScreen({super.key});
  @override ConsumerState<ProfileScreen> createState()=>_ProfileScreenState();
}
class _ProfileScreenState extends ConsumerState<ProfileScreen>{
  final name=TextEditingController(); final headline=TextEditingController(); final skills=TextEditingController();
  bool loading=false;
  Future<void> save() async{
    setState(()=>loading=true);
    final dio=ref.read(authProvider.notifier).authed();
    await dio.post('/users/me', data:{'fullName':name.text,'headline':headline.text,'skills':skills.text});
    if(mounted)Navigator.pop(context);
  }
  @override Widget build(BuildContext context)=>Padding(
    padding: const EdgeInsets.all(16),
    child: Column(children:[
      TextField(controller: name, decoration: const InputDecoration(labelText:'Full name')),
      TextField(controller: headline, decoration: const InputDecoration(labelText:'Headline')),
      TextField(controller: skills, decoration: const InputDecoration(labelText:'Skills')),
      const SizedBox(height:16),
      FilledButton(onPressed: loading?null:save, child: const Text('Save'))
    ]),
  );
}
