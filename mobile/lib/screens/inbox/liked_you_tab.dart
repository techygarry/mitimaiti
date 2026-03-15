import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../providers/inbox_provider.dart';
import '../../theme.dart';
import '../../widgets/empty_state.dart';

class LikedYouTab extends ConsumerWidget {
  const LikedYouTab({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(inboxProvider);
    final likes = state.likedYou;

    if (likes.isEmpty) {
      return const EmptyState(
        icon: Icons.favorite_outline,
        title: 'No likes yet',
        message: 'Keep completing your profile to attract more people!',
      );
    }

    return GridView.builder(
      padding: const EdgeInsets.all(16),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
        childAspectRatio: 0.7,
      ),
      itemCount: likes.length,
      itemBuilder: (_, i) {
        final like = likes[i];
        final user = like.user;

        return Semantics(
          label: '${user.displayName}, ${user.age} years old from ${user.city}. Tap to view profile.',
          button: true,
          child: GestureDetector(
            onTap: () => context.push('/profile/other', extra: user),
            child: Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.05),
                    blurRadius: 8,
                  ),
                ],
              ),
              child: Column(
                children: [
                  Expanded(
                    flex: 3,
                    child: ClipRRect(
                      borderRadius: const BorderRadius.vertical(
                        top: Radius.circular(16),
                      ),
                      child: user.photos.isNotEmpty
                          ? CachedNetworkImage(
                              imageUrl: user.photos.first.url,
                              fit: BoxFit.cover,
                              width: double.infinity,
                              placeholder: (_, __) => Container(
                                color: MitiMaitiTheme.border,
                                child: const Center(
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    color: MitiMaitiTheme.rose,
                                  ),
                                ),
                              ),
                              errorWidget: (_, __, ___) => _PlaceholderAvatar(),
                            )
                          : _PlaceholderAvatar(),
                    ),
                  ),
                  Expanded(
                    flex: 1,
                    child: Padding(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 8,
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            '${user.displayName}, ${user.age ?? ""}',
                            style: const TextStyle(
                              fontWeight: FontWeight.w600,
                              fontSize: 15,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 2),
                          Text(
                            user.city ?? '',
                            style: const TextStyle(
                              fontSize: 13,
                              color: MitiMaitiTheme.textSecondary,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          if (like.comment != null) ...[
                            const SizedBox(height: 4),
                            Text(
                              '"${like.comment}"',
                              style: const TextStyle(
                                fontSize: 12,
                                fontStyle: FontStyle.italic,
                                color: MitiMaitiTheme.rose,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ],
                      ),
                    ),
                  ),
                  // Action buttons
                  Padding(
                    padding: const EdgeInsets.only(
                      left: 8,
                      right: 8,
                      bottom: 8,
                    ),
                    child: Row(
                      children: [
                        Expanded(
                          child: Semantics(
                            label: 'Pass on ${user.displayName}',
                            child: SizedBox(
                              height: 36,
                              child: OutlinedButton(
                                onPressed: () {
                                  ref
                                      .read(inboxProvider.notifier)
                                      .passLike(like.id);
                                },
                                style: OutlinedButton.styleFrom(
                                  minimumSize: Size.zero,
                                  padding: EdgeInsets.zero,
                                  side: const BorderSide(
                                    color: MitiMaitiTheme.border,
                                  ),
                                ),
                                child: const Icon(
                                  Icons.close,
                                  size: 18,
                                  color: MitiMaitiTheme.textSecondary,
                                ),
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Semantics(
                            label: 'Like ${user.displayName} back',
                            child: SizedBox(
                              height: 36,
                              child: ElevatedButton(
                                onPressed: () {
                                  ref
                                      .read(inboxProvider.notifier)
                                      .likeBack(like.id);
                                },
                                style: ElevatedButton.styleFrom(
                                  minimumSize: Size.zero,
                                  padding: EdgeInsets.zero,
                                ),
                                child: const Icon(
                                  Icons.favorite,
                                  size: 18,
                                  color: Colors.white,
                                ),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}

class _PlaceholderAvatar extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      color: MitiMaitiTheme.border,
      width: double.infinity,
      child: Center(
        child: Icon(
          Icons.person,
          size: 48,
          color: MitiMaitiTheme.textSecondary.withValues(alpha: 0.3),
        ),
      ),
    );
  }
}
