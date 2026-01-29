import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/auth_service.dart';
import '../ui/widgets/app_card.dart';

class NotificationsScreen extends ConsumerStatefulWidget {
  const NotificationsScreen({super.key});
  @override ConsumerState<NotificationsScreen> createState()=>_NotificationsScreenState();
}
class _NotificationsScreenState extends ConsumerState<NotificationsScreen>{
  bool loading=true; List items=[];
  @override void initState(){super.initState();load();}
  Future<void> load() async{
    final dio=ref.read(authProvider.notifier).authed();
    final res=await dio.get('/notifications/me');
    setState((){items=res.data;loading=false;});
  }
  @override Widget build(BuildContext context)=>loading?const Center(child:CircularProgressIndicator()):ListView(children:[
    for(final n in items) AppCard(child: ListTile(title: Text(n['title']??''), subtitle: Text(n['message']??'')))
  ]);
}
