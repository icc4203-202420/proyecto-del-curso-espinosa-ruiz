class API::V1::EventsController < ApplicationController
    include ImageProcessing
    include Authenticable
    #Image = flyer
    respond_to :json
    before_action :set_event, only: [:show, :update]
    before_action :verify_jwt_token, only: [:create, :update]
    
    # before_action :set_bar

    def index
      @events = Event.all
      render json: @events , status: :ok
    end
    
    # `GET /api/v1/events/:id`

    def show
      @event = Event.includes(:attendances).find(params[:id])
      event_json = @event.as_json(include: [:attendances])
    
      if @event.flyer.attached?
        event_json.merge!({
          flyer_url: url_for(@event.flyer),
          thumbnail_url: url_for(@event.thumbnail)
        })
      end
    
      render json: { event: event_json }, status: :ok
    end



    # `POST /api/v1/events`
    def create
        @event = Event.new(event_params.except(:image_base64))
        handle_image_attachment if event_params[:image_base64]

        if @event.save
            render json: { event: @event, message: "Event created succesfully." }, status: :created
        else
            render json: @event.errors, status: :unprocessable_entity
        end
    end
    
    # `PATCH /api/v1/events`
    def update
        handle_image_attachment if event_params[:image_base64]
      
        if @event.update(event_params.except(:image_base64))
          render json: { event: @event, message: 'Event updated successfully.' }, status: :ok
        else
          render json: @event.errors, status: :unprocessable_entity
        end
    end

    def generate_event_summary_video
      event = Event.find(params[:id])
  
      # Asegúrate de que las imágenes existen y obtén sus rutas
      event_pictures = EventPicture.where(event_id: event.id)
      image_paths = event_pictures.map do |event_picture|
        if event_picture.event_picture.attached?
          ActiveStorage::Blob.service.path_for(event_picture.event_picture.key)
        end
      end.compact
  
      if image_paths.empty?
        render json: { error: "No images available for the event" }, status: :unprocessable_entity
        return
      end
  
      # Define la ruta de salida para el video
      output_video_path = Rails.root.join("storage", "videos", "#{event.id}_summary.mp4")
  
      # Asegúrate de que la carpeta de salida exista
      FileUtils.mkdir_p(File.dirname(output_video_path))
  
      # Comando FFmpeg para generar el video
      ffmpeg_command = "ffmpeg -framerate 1 #{image_paths.map { |path| "-i '#{path}'" }.join(' ')} -c:v libx264 -r 30 -pix_fmt yuv420p #{output_video_path}"
  
      # Ejecutar el comando FFmpeg y verificar su éxito
      system(ffmpeg_command)
  
      # Verifica que el archivo de video fue generado
      unless File.exist?(output_video_path)
        render json: { error: "Failed to generate video summary" }, status: :internal_server_error
        return
      end
  
      # Adjuntar el video generado al evento mediante ActiveStorage
      event.summary_video.attach(io: File.open(output_video_path), filename: "#{event.id}_summary.mp4", content_type: "video/mp4")
  
      render json: { message: "Summary video generated successfully", video_url: url_for(event.summary_video) }, status: :ok
    end


    def mark_assistance
        @attendance = Attendance.find_by(user_id: current_user.id, event_id: params[:id])
        if @attendance
          @attendance.destroy
          render json: { message: 'Assistance removed' }, status: :ok
        else
          Attendance.create(user_id: current_user.id, event_id: params[:id], checked_in: true)
          render json: { message: 'Assistance marked' }, status: :created
      end
    end

    def upload_event_image
      @event = Event.find(params[:id])
      @user = current_user
      @event_picture = EventPicture.new(event_id: @event.id, user_id: @user.id, description: params[:description])
  
      if params[:picture].present?
        @event_picture.event_picture.attach(params[:picture])
        if @event_picture.save
          tagged_users_ids = JSON.parse(params[:tagged_users]) rescue []
          tagged_users_ids.each do |user_id|
            TaggedUser.create(user_id: user_id, event_picture_id: @event_picture.id)
          end
          render json: { message: 'Image uploaded successfully' }, status: :created
        else
          render json: { message: 'Error uploading image' }, status: :unprocessable_entity
        end
      else
        render json: { error: 'No image provided' }, status: :unprocessable_entity
      end
    end

    def get_event_images
      event_pictures = EventPicture.where(event_id: params[:id])
      images_urls = event_pictures.map do |event_picture|
        if event_picture.event_picture.attached?
          {
            id: event_picture.id,
            user_id: event_picture.user_id,
            description: event_picture.description,
            tagged_users: TaggedUser.where(event_picture_id: event_picture.id).pluck(:user_id),
            url: url_for(event_picture.event_picture)
          }
        end
      end.compact
      render json: { event_pictures: images_urls}, status: :ok
    end

      private

      def set_event
        @event = Event.find_by(id: params[:id])
        render json: { error: 'Event not found' }, status: :not_found if @event.nil?
      end  

      # def set_bar
      #   @bar = Bar.find(params[:bar_id])
      # end
      
      def event_params
        params.require(:event).permit(:name, :description, :date, :bar_id, 
          :start_date, :end_date, :image_base64)
      end      
      
      def handle_image_attachment
        decoded_image = decode_image(event_params[:image_base64])
        @event.image.attach(io: decoded_image[:io], 
          filename: decoded_image[:filename], 
          content_type: decoded_image[:content_type])
      end 
      
      def verify_jwt_token
        authenticate_user!
        head :unauthorized unless current_user
      end

    end