local KEY = KEYS[1]
local FROM = tonumber(ARGV[1])
local TO = tonumber(ARGV[2])

if FROM == nil then return redis.redis_error('origin must be a number') end
if TO == nil then return redis.redis_error('destination must be a number') end

local list = redis.call('lrange', KEY, 0, -1)

if FROM == TO then return 'OK' end
if FROM < 0 then FROM = #list + FROM end
if TO < 0 then TO = #list + TO end

-- provided indexes are 0-based
local val = table.remove(list, FROM + 1)
table.insert(list, TO + 1, val)

redis.call('del', KEY)
redis.call('rpush', KEY, unpack(list))
return 'OK'
