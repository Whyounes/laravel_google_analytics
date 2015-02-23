<?php


class GA_Utils
{

  public static function encodeDimensionFilters($filters)
  {
    $url = [];

    foreach ($filters as $filter) {
      $operator = "";
      if ($filter['rule'] == "contain") {
        if ($filter['show'] == "show") {
          $operator = '=@';
        } else {
          $operator = '!@';
        }
      } else {
        if ($filter['rule'] == "exact") {
          if ($filter['show'] == "show") {
            $operator = '==';
          } else {
            $operator = '!=';
          }
        } else {
          if ($filter['rule'] == "regexp") {
            if ($filter['show'] == "show") {
              $operator = '=~';
            } else {
              $operator = '!~';
            }
          }
        }
      }

      $url[] = "{$filter['column']}{$operator}{$filter['val']}";
    }//foreach

    $uri = implode(";", $url);

    //$uri = urlencode($uri);

    return $uri;
  }//encodeDimensionFilters

  public static function encodeMetricFilters($filters)
  {
    $url = [];

    foreach ($filters as $filter) {
      $operator = "";

      //metric rules
      if ($filter['rule'] == "eq") {
        if ($filter['show'] == "show") {
          $operator = '==';
        } else {
          $operator = '!=';
        }
      } else {
        if ($filter['rule'] == "gt") {
          if ($filter['show'] == "show") {
            $operator = '>';
          } else {
            $operator = '<';
          }
        } else {
          if ($filter['rule'] == "lt") {
            if ($filter['show'] == "show") {
              $operator = '<';
            } else {
              $operator = '>';
            }
          } else {
            if ($filter['rule'] == "gteq") {
              if ($filter['show'] == "show") {
                $operator = '>=';
              } else {
                $operator = '<=';
              }
            } else {
              if ($filter['rule'] == "lteq") {
                if ($filter['show'] == "show") {
                  $operator = '<=';
                } else {
                  $operator = '>=';
                }
              }
            }
          }
        }
      }


      $url[] = "{$filter['column']}{$operator}{$filter['val']}";
    }//foreach

    $uri = implode(";", $url);

    return $uri;
  }//encodeMetricFilters

  public static function groupFilters(array $show, array $filters, array $rules, array $values)
  {
    $count = count($filters);
    $group_filters = [];

    for ($i = 0; $i < $count; $i++) {
      // skip if no value is provided
      if (empty($values[$i])) {
        continue;
      }

      $group_filters[] = [
          'show'   => $show[$i],
          'column' => $filters[$i],
          'rule'   => $rules[$i],
          'val'    => $values[$i]
      ];
    }//for

    return $group_filters;
  }//groupFilters

  public static function groupOrderby(array $orderbys, array $rules)
  {
    $count = count($orderbys);
    $group_orderbys = [];

    for ($i = 0; $i < $count; $i++) {
      $group_orderbys[] = [
          'column' => $orderbys[$i],
          'rule'   => $rules[$i]
      ];
    }//for

    return $group_orderbys;
  }//groupOrderby

  public static function encodeOrderby($orderbys)
  {
    $res = [];

    foreach ($orderbys as $orderby) {
      $res[] = $orderby['rule'] . $orderby['column'];
    }//foreach

    return implode(',', $res);
  }//encodeOrderby
}//class
