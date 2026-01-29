import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/auth_service.dart';
import '../ui/widgets/app_card.dart';

class FounderDashboard extends ConsumerStatefulWidget {
  const FounderDashboard({super.key});
  @override ConsumerState<FounderDashboard> createState()=>_FounderDashboardState();
}
class _FounderDashboardState extends ConsumerState<FounderDashboard>{
  bool loading=true; List items=[];
  @override void initState(){super.initState();load();}
  Future<void> load() async{
    final dio=ref.read(authProvider.notifier).authed();
    final res=await dio.get('/startups/my');
    setState((){items=res.data;loading=false;});
  }
  @override Widget build(BuildContext context)=>loading?const Center(child:CircularProgressIndicator()):ListView.builder(
    padding: const EdgeInsets.all(8),
    itemCount: items.length,
    itemBuilder:(_,i)=>AppCard(child:ListTile(title:Text(items[i]['name']??''),subtitle:Text(items[i]['stage']??'')))) ;
}
