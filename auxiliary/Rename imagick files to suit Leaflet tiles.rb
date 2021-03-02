tile_width = 256
tile_height = 256
image_width = 18432
image_height = 18432
n = 0
# To get this number, look at the number of tiles 
# generated, find the last tile number and add 1
# e.g. tiles_99.png => total_tiles = 100
total_tiles = 5184 

tiles_per_column = image_width/tile_width

#71
row = 0
column = 0
(n...total_tiles).each do |i|
  filename = "tile#{i}.jpg" # current filename
  target = "map_#{column}_#{row}.jpg" # new filename

  puts "copy #{filename} to #{target}" 

  # rename file
  File.rename(filename, target)

  # work out next step
  column = column + 1
  if column >= tiles_per_column
    column = 0
    row = row + 1
  end
end