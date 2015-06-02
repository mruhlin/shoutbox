class PhotoController < ActionController::Base

  def initialize(options = {})
  end

  def get_photo_path(id)
    id_hash = (id.to_i(36) % 128).to_s
    File.join("/photoUploads",id_hash, id)
  end

  def upload
    photo = params['upload']
    original_filename = photo.original_filename
    id = SecureRandom.uuid + File.extname(original_filename)

    path = File.join("public", get_photo_path(id))
    FileUtils::mkdir_p File.dirname(path)
    File.open(path, "wb") { |f| f.write(photo.read) }

    #TODO : error handling!
    msg = { :status => "ok", :id => id }
    render :json => msg
  end

  def get
    redirect_to get_photo_path(params['id'])
  end
end
