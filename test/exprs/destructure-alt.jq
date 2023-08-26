.resources[] as {
  $id,
  $kind,
  events: {
    $user_id,
    $ts
  }
} ?// {
  $id,
  $kind,
  events: [{$user_id, $ts}]
} | {
  $user_id,
  $kind,
  $id,
  $ts
}
  | .[] as [
    $id,
    $kind,
    $user_id,
    $ts
  ] ?// {
    $id,
    $kind,
    $user_id,
    $ts
  }
  | .
  | .resources[] as {
    $id,
    $kind,
    events: {$user_id, $ts}
  } ?//
      {
        $id,
        $kind,
        events: [{
          $first_user_id,
          $first_ts
        }]
      }
  | {$user_id, $first_user_id, $kind, $id, $ts, $first_ts}
  | [[3]]
  | .[] as [$a] ?//
      [$b]
  | if $a != null
    then
      error("err: \($a)")
    else
      {$a,$b}
    end
