. as { realnames: $names, posts: [$first, $second] } | ..
  | .realnames as $names | .posts[] |
    { title, author: $names[.author] }
  | .resources[] as { $id, $kind, events: {$user_id, $ts} } ?//
      { $id, $kind, events: [{ $user_id, $ts }] }
  | { $user_id, $kind, $id, $ts }
