import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/auth_service.dart';
import '../ui/widgets/app_card.dart';

class ProfessionalDashboard extends ConsumerStatefulWidget {
  const ProfessionalDashboard({super.key});
  @override ConsumerState<ProfessionalDashboard> createState()=>_ProfessionalDashboardState();
}
class _ProfessionalDashboardState extends ConsumerState<ProfessionalDashboard>{
  bool loading=true; List items=[];
  @override void initState(){super.initState();load();}
  Future<void> load() async{
    final dio=ref.read(authProvider.notifier).authed();
    final res=await dio.post('/match/user/me');
    setState((){items=res.data;loading=false;});
  }
  @override Widget build(BuildContext context)=>loading?const Center(child:CircularProgressIndicator()):ListView.builder(
    padding: const EdgeInsets.all(8),
    itemCount: items.length,
    itemBuilder:(_,i)=>AppCard(child:ListTile(title:Text(items[i]['startupName']??''),trailing:Text('${items[i]['score']}%'))));
}
