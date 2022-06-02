local KEY = KEYS[1]
local INDEX = tonumber(ARGV[1])

if INDEX == nil then return redis.redis_error('origin must be a number') end

local list = redis.call('lrange', KEY, 0, -1)

if INDEX < 0 then INDEX = #list + INDEX end

-- provided indexes are 0-based
table.remove(list, INDEX + 1)

redis.call('del', KEY)

-- If there is at least one element, call rpush
if (next(list) ~= nil) then
  redis.call('rpush', KEY, unpack(list))
end

return 'OK'
