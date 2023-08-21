label $out | break $out
# | reduce .[] as $item (null; if .==false then break $out else .. end)
