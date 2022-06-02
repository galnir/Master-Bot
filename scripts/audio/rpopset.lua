local SOURCE = KEYS[1]
local DESTINATION = KEYS[2]

local value = redis.call('rpop', SOURCE)

if value then
  redis.call('set', DESTINATION, value)
  return value
end

redis.call('del', DESTINATION)
return nil
