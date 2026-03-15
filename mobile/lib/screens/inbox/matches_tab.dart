import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../models/match.dart';
import '../../providers/inbox_provider.dart';
import '../../theme.dart';
import '../../widgets/countdown_timer.dart';
import '../../widgets/empty_state.dart';

class MatchesTab extends ConsumerWidget {
  const MatchesTab({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(inboxProvider);
    final matches = state.matches;

    if (matches.isEmpty) {
      return const EmptyState(
        icon: Icons.chat_bubble_outline,
        title: 'No matches yet',
        message: 'Start liking profiles you connect with!',
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.symmetric(vertical: 8),
      itemCount: matches.length,
      itemBuilder: (_, i) {
        final match = matches[i];
        return _MatchTile(match: match);
      },
    );
  }
}

class _MatchTile extends StatelessWidget {
  final Match match;

  const _MatchTile({required this.match});

  @override
  Widget build(BuildContext context) {
    final user = match.otherUser;
    final isNew = match.status == MatchStatus.pending;

    return Semantics(
      label: '${user.displayName}. ${isNew ? "New match" : match.lastMessage?.content ?? ""}',
      button: true,
      child: InkWell(
        onTap: () => context.push('/chat/${match.id}'),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          child: Row(
            children: [
              // Avatar
              Stack(
                children: [
                  CircleAvatar(
                    radius: 28,
                    backgroundColor: MitiMaitiTheme.border,
                    child: user.photos.isNotEmpty
                        ? ClipOval(
                            child: CachedNetworkImage(
                              imageUrl: user.photos.first.url,
                              fit: BoxFit.cover,
                              width: 56,
                              height: 56,
                              placeholder: (_, __) => Container(
                                color: MitiMaitiTheme.border,
                              ),
                              errorWidget: (_, __, ___) => Icon(
                                Icons.person,
                                color: MitiMaitiTheme.textSecondary
                                    .withValues(alpha: 0.5),
                              ),
                            ),
                          )
                        : Icon(
                            Icons.person,
                            color: MitiMaitiTheme.textSecondary
                                .withValues(alpha: 0.5),
                          ),
                  ),
                  if (match.unreadCount > 0)
                    Positioned(
                      top: 0,
                      right: 0,
                      child: Container(
                        width: 18,
                        height: 18,
                        decoration: const BoxDecoration(
                          color: MitiMaitiTheme.rose,
                          shape: BoxShape.circle,
                        ),
                        child: Center(
                          child: Text(
                            match.unreadCount > 9
                                ? '9+'
                                : '${match.unreadCount}',
                            style: const TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w700,
                              color: Colors.white,
                            ),
                          ),
                        ),
                      ),
                    ),
                ],
              ),
              const SizedBox(width: 14),

              // Content
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            user.displayName,
                            style: TextStyle(
                              fontWeight: match.unreadCount > 0
                                  ? FontWeight.w700
                                  : FontWeight.w600,
                              fontSize: 16,
                            ),
                          ),
                        ),
                        if (isNew)
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 2,
                            ),
                            decoration: BoxDecoration(
                              color: MitiMaitiTheme.gold.withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: const Text(
                              'NEW',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w700,
                                color: MitiMaitiTheme.gold,
                              ),
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            isNew
                                ? 'Send a message to start the conversation!'
                                : match.lastMessage?.content ?? '',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              fontSize: 13,
                              color: match.unreadCount > 0
                                  ? MitiMaitiTheme.charcoal
                                  : MitiMaitiTheme.textSecondary,
                              fontWeight: match.unreadCount > 0
                                  ? FontWeight.w500
                                  : FontWeight.w400,
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        // Countdown
                        CountdownTimer(
                          expiresAt: match.expiresAt,
                          showIcon: false,
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: match.isExpiringSoon
                                ? MitiMaitiTheme.error
                                : MitiMaitiTheme.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
