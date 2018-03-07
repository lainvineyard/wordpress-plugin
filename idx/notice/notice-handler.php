<?php

namespace IDX\Notice;

/* Has a bulk add notice method and holds all notice conditions.
 *
 * Currently supports detection and creation of specific plugins notices:
 *   Yoast,
 */
class Notice_Handler {
	// We don't want anyone instantiating this class
	private function __construct() {}

	// Returns array of all non-dismissed notices
	public static function get_all_notices() {
		$notices = [];

		// Always use the name returned from the notice function to avoid mistyping
		$name = self::yoast();
		if ( $name ) {
			$notices[] = new Notice(
				$name,
				__( 'Yoast is not allowing your pages to be indexed!', 'idxbroker' ),
				'error',
				'https://support.idxbroker.com/customer/portal/articles/2925410-fix-no-index',
				__( 'How can I fix this?', 'idxbroker' )
			);
		}

		return $notices;
	}

	// Function called via ajax to dismiss the notice
	public static function dismissed() {
		check_ajax_referer( 'idx-notice-nonce' );
		$post = filter_input_array( INPUT_POST );
		if ( isset( $post['name'] ) && '' !== $post['name'] ) {
			$name = $post['name'];
			update_option( "idx-notice-dismissed-$name", true );
		}
		wp_die();
	}

	// Checks if Yoast is noindexing our custom page types
	//
	// Returns the unique notice name if notice needs to be displayed, false otherwise
	private static function yoast() {
		$name = 'yoast';
		// If Yoast not active, return
		if ( is_plugin_inactive( 'wordpress-seo/wp-seo.php' ) ) {
			// Deletes the notice option is the notice now that the problem is resolved.
			// The user should be notified if they dismissed an option, fixed the problem,
			// then the problem arises later.
			self::delete_dismissed_option( $name );
			return false;
		}

		// Yoast stores the page type visibility option in their xml sitemap option table
		$data = get_option( 'wpseo_xml' );

		$wrapper_no_index   = (boolean) $data['post_types-idx-wrapper-not_in_sitemap'];
		$idx_pages_no_index = (boolean) $data['post_types-idx_page-not_in_sitemap'];

		if ( $wrapper_no_index || $idx_pages_no_index ) {
			if ( self::is_dismissed( $name ) ) {
				return false;
			}
			return $name;
		}
		self::delete_dismissed_option( $name );
		return false;
	}

	// $name should only be passed in from the returned notice functions
	private function delete_dismissed_option( $name ) {
		delete_option( "idx-notice-dismissed-$name" );
	}

	// Checks wp_options if a specific notice has been dismissed
	private static function is_dismissed( $name ) {
		return get_option( "idx-notice-dismissed-$name" );
	}
}