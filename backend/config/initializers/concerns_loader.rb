Dir[Rails.root.join('app/controllers/concerns/**/*.rb')].each do |concern|
  require concern
end