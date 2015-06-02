class CreateComments < ActiveRecord::Migration
  def change
    create_table :comments do |t|
      t.string :user
      t.text :body
      t.string :image_id
      t.string :photo_id

      t.timestamps null: false
    end
  end
end
