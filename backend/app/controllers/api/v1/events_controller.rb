class API::V1::EventsController < ApplicationController
    include ImageProcessing
    include Authenticable
    #Image = flyer
    respond_to :json
    before_action :set_event, only: [:show, :update]
    before_action :verify_jwt_token, only: [:create, :update]
    
    before_action :set_bar

    def index
      @events = @bar.events
      render json: { events: @events }, status: :ok
    end

    # `GET /api/v1/events/:id`
    def show
        if @event.image.attached?
            render json: @event.as_json.merge({
                image_url: url_for(@event.image),
                thumbnail_url: url_for(@event.thumbnail)}),
                status: :ok
        else
            render json: { event: @event.as_json }, status: :ok
        end
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
      

      private

      def set_event
        @event = Event.find_by(id: params[:id])
        render json: { error: 'Event not found' }, status: :not_found if @event.nil?
      end  

      def set_bar
        @bar = Bar.find(params[:bar_id])
      end
      
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