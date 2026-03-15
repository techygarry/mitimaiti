import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../models/user.dart';
import '../theme.dart';

class PhotoGallery extends StatefulWidget {
  final List<Photo> photos;
  final double height;
  final double borderRadius;
  final bool showIndicator;
  final bool showVerifiedBadge;
  final bool isVerified;

  const PhotoGallery({
    super.key,
    required this.photos,
    this.height = 400,
    this.borderRadius = MitiMaitiTheme.cardRadius,
    this.showIndicator = true,
    this.showVerifiedBadge = false,
    this.isVerified = false,
  });

  @override
  State<PhotoGallery> createState() => _PhotoGalleryState();
}

class _PhotoGalleryState extends State<PhotoGallery> {
  int _currentIndex = 0;
  final PageController _pageController = PageController();

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (widget.photos.isEmpty) {
      return Container(
        height: widget.height,
        decoration: BoxDecoration(
          color: MitiMaitiTheme.border,
          borderRadius: BorderRadius.circular(widget.borderRadius),
        ),
        child: const Center(
          child: Icon(
            Icons.person,
            size: 64,
            color: MitiMaitiTheme.textSecondary,
          ),
        ),
      );
    }

    return ClipRRect(
      borderRadius: BorderRadius.circular(widget.borderRadius),
      child: SizedBox(
        height: widget.height,
        child: Stack(
          children: [
            // Photo pager
            PageView.builder(
              controller: _pageController,
              itemCount: widget.photos.length,
              onPageChanged: (index) {
                setState(() => _currentIndex = index);
              },
              itemBuilder: (context, index) {
                return Semantics(
                  label: 'Photo ${index + 1} of ${widget.photos.length}',
                  image: true,
                  child: CachedNetworkImage(
                    imageUrl: widget.photos[index].url,
                    fit: BoxFit.cover,
                    width: double.infinity,
                    height: widget.height,
                    placeholder: (context, url) => Container(
                      color: MitiMaitiTheme.border,
                      child: const Center(
                        child: CircularProgressIndicator(
                          color: MitiMaitiTheme.rose,
                          strokeWidth: 2,
                        ),
                      ),
                    ),
                    errorWidget: (context, url, error) => Container(
                      color: MitiMaitiTheme.border,
                      child: const Center(
                        child: Icon(
                          Icons.broken_image,
                          size: 48,
                          color: MitiMaitiTheme.textSecondary,
                        ),
                      ),
                    ),
                  ),
                );
              },
            ),

            // Tap zones for prev/next
            Row(
              children: [
                Expanded(
                  child: GestureDetector(
                    onTap: () {
                      if (_currentIndex > 0) {
                        _pageController.previousPage(
                          duration: const Duration(milliseconds: 300),
                          curve: Curves.easeInOut,
                        );
                      }
                    },
                    behavior: HitTestBehavior.translucent,
                    child: const SizedBox.expand(),
                  ),
                ),
                Expanded(
                  child: GestureDetector(
                    onTap: () {
                      if (_currentIndex < widget.photos.length - 1) {
                        _pageController.nextPage(
                          duration: const Duration(milliseconds: 300),
                          curve: Curves.easeInOut,
                        );
                      }
                    },
                    behavior: HitTestBehavior.translucent,
                    child: const SizedBox.expand(),
                  ),
                ),
              ],
            ),

            // Photo indicators
            if (widget.showIndicator && widget.photos.length > 1)
              Positioned(
                top: 12,
                left: 12,
                right: 12,
                child: Row(
                  children: List.generate(widget.photos.length, (index) {
                    return Expanded(
                      child: Container(
                        height: 3,
                        margin: EdgeInsets.only(
                          right: index < widget.photos.length - 1 ? 4 : 0,
                        ),
                        decoration: BoxDecoration(
                          color: index == _currentIndex
                              ? Colors.white
                              : Colors.white.withValues(alpha: 0.4),
                          borderRadius: BorderRadius.circular(2),
                        ),
                      ),
                    );
                  }),
                ),
              ),

            // Verified badge
            if (widget.showVerifiedBadge && widget.isVerified)
              Positioned(
                bottom: 12,
                right: 12,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: MitiMaitiTheme.success,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.verified, size: 14, color: Colors.white),
                      SizedBox(width: 4),
                      Text(
                        'Verified',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: Colors.white,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
