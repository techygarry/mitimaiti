import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;
import '../config/api_config.dart';
import 'storage_service.dart';

final socketServiceProvider = Provider<SocketService>((ref) {
  final storage = ref.read(storageServiceProvider);
  return SocketService(storage);
});

typedef SocketEventCallback = void Function(dynamic data);

class SocketService {
  final StorageService _storage;
  io.Socket? _socket;
  final Map<String, List<SocketEventCallback>> _listeners = {};

  SocketService(this._storage);

  bool get isConnected => _socket?.connected ?? false;

  void connect() {
    final token = _storage.getAccessToken();
    if (token == null) return;

    _socket = io.io(
      ApiConfig.wsUrl,
      io.OptionBuilder()
          .setTransports(['websocket'])
          .setExtraHeaders({'Authorization': 'Bearer $token'})
          .enableAutoConnect()
          .enableReconnection()
          .setReconnectionAttempts(5)
          .setReconnectionDelay(2000)
          .build(),
    );

    _socket!.onConnect((_) {
      _notifyListeners('connect', null);
    });

    _socket!.onDisconnect((_) {
      _notifyListeners('disconnect', null);
    });

    _socket!.onError((error) {
      _notifyListeners('error', error);
    });

    // Chat events
    _socket!.on('new_message', (data) {
      _notifyListeners('new_message', data);
    });

    _socket!.on('message_read', (data) {
      _notifyListeners('message_read', data);
    });

    _socket!.on('typing', (data) {
      _notifyListeners('typing', data);
    });

    _socket!.on('stop_typing', (data) {
      _notifyListeners('stop_typing', data);
    });

    // Match events
    _socket!.on('new_match', (data) {
      _notifyListeners('new_match', data);
    });

    _socket!.on('new_like', (data) {
      _notifyListeners('new_like', data);
    });

    _socket!.on('match_expired', (data) {
      _notifyListeners('match_expired', data);
    });

    // Family events
    _socket!.on('family_suggestion', (data) {
      _notifyListeners('family_suggestion', data);
    });
  }

  void disconnect() {
    _socket?.disconnect();
    _socket?.dispose();
    _socket = null;
  }

  void on(String event, SocketEventCallback callback) {
    _listeners.putIfAbsent(event, () => []).add(callback);
  }

  void off(String event, [SocketEventCallback? callback]) {
    if (callback != null) {
      _listeners[event]?.remove(callback);
    } else {
      _listeners.remove(event);
    }
  }

  void emit(String event, [dynamic data]) {
    _socket?.emit(event, data);
  }

  void sendTyping(String matchId) {
    emit('typing', {'match_id': matchId});
  }

  void sendStopTyping(String matchId) {
    emit('stop_typing', {'match_id': matchId});
  }

  void joinChat(String matchId) {
    emit('join_chat', {'match_id': matchId});
  }

  void leaveChat(String matchId) {
    emit('leave_chat', {'match_id': matchId});
  }

  void _notifyListeners(String event, dynamic data) {
    final callbacks = _listeners[event];
    if (callbacks != null) {
      for (final callback in callbacks) {
        callback(data);
      }
    }
  }
}
