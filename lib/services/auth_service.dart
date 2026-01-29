import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';

final authProvider = StateNotifierProvider<AuthController, AuthState>((ref) => AuthController());

class AuthState {
  final bool isAuthenticated;
  final String token;
  final String role;
  final int userId;
  const AuthState({required this.isAuthenticated, required this.token, required this.role, required this.userId});
  factory AuthState.unauth() => const AuthState(isAuthenticated:false, token:'', role:'', userId:0);
}

class AuthController extends StateNotifier<AuthState> {
  AuthController(): super(AuthState.unauth()) { _load(); }
  final dio = Dio(BaseOptions(baseUrl: const String.fromEnvironment('API_BASE', defaultValue: 'http://localhost:8080')));

  Future<void> _load() async {
    final p = await SharedPreferences.getInstance();
    final t = p.getString('token') ?? ''; final r = p.getString('role') ?? ''; final u = p.getInt('userId') ?? 0;
    if (t.isNotEmpty) state = AuthState(isAuthenticated:true, token:t, role:r, userId:u);
  }

  Dio authed() {
    final d = Dio(BaseOptions(baseUrl: dio.options.baseUrl));
    d.options.headers['Authorization'] = 'Bearer ${state.token}';
    return d;
  }

  Future<void> login(String email, String password) async {
    final res = await dio.post('/auth/login', data:{'email': email,'password': password});
    final p = await SharedPreferences.getInstance();
    await p.setString('token', res.data['token']);
    await p.setString('role', res.data['role']);
    await p.setInt('userId', res.data['userId'] ?? 0);
    state = AuthState(isAuthenticated:true, token:res.data['token'], role:res.data['role'], userId:res.data['userId'] ?? 0);
  }
}
