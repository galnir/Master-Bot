math.randomseed(tonumber(ARGV[1]))
local function shuffle(t)
  for i = #t, 1, -1 do
    local rand = math.random(i)
    t[i], t[rand] = t[rand], t[i]
  end
  return t
end

local KEY = KEYS[1]
local list = redis.call('lrange', KEY, 0, -1)

if #list > 0 then
  shuffle(list)
  redis.call('del', KEY)
  redis.call('lpush', KEY, unpack(list))
end

return 'OK'
